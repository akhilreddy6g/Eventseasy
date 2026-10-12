package com.eventseasy.backend;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import jakarta.annotation.PostConstruct;
import jakarta.servlet.http.HttpServletResponse;
import org.bson.Document;
import org.bson.types.ObjectId;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Date;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import static com.eventseasy.backend.Values.doc;
import static com.eventseasy.backend.Values.result;

/** Owns the Overview, Destination, and Landmark event documents. */
@Service
public class EventContentService {
    private static final long MAX_IMAGE_BYTES = 5L * 1024 * 1024;
    private static final int MAX_LANDMARK_DELETE_ITEMS = 100;
    private static final Set<String> ASSET_KINDS = Set.of("overview", "landmark");

    private final MongoStore store;
    private final EventAccessService access;
    private final Cloudinary cloudinary;
    private final CloudinarySettings cloudinarySettings;
    private final MediaTokenService deliveryTokens;
    private final StringRedisTemplate redis;
    private final HttpClient http = HttpClient.newBuilder().followRedirects(HttpClient.Redirect.NORMAL).build();

    public EventContentService(MongoStore store, EventAccessService access, Cloudinary cloudinary,
                               CloudinarySettings cloudinarySettings, MediaTokenService deliveryTokens,
                               StringRedisTemplate redis) {
        this.store = store;
        this.access = access;
        this.cloudinary = cloudinary;
        this.cloudinarySettings = cloudinarySettings;
        this.deliveryTokens = deliveryTokens;
        this.redis = redis;
    }

    @PostConstruct
    void createIndexes() {
        store.ensureIndex("event_overview", doc("eventId", 1, "status", 1), "event_overview_event");
        store.ensureIndex("event_destination", doc("eventId", 1, "status", 1), "event_destination_event");
        store.ensureIndex("event_landmarks", doc("eventId", 1, "status", 1, "createdAt", 1), "event_landmarks_event");
        store.ensureIndex("event_assets", doc("eventId", 1, "kind", 1, "asset.id", 1), "event_assets_lookup");
    }

    public Document access(String eventId, String user) {
        EventAccessService.Membership member = access.requireMember(eventId, user);
        return result(true, doc("role", member.role(), "canEdit", member.canEditEventContent()));
    }

    public Document overview(String eventId, String user) {
        EventAccessService.Membership member = access.requireMember(eventId, user);
        Document current = store.one("event_overview", activeEvent(eventId));
        Document event = store.one("events", doc("_id", access.objectId(eventId), "status", doc("$ne", "Inactive")));
        if (event == null) throw problem(404, "Event not found");
        Document output = doc(
            "title", current == null ? event.getString("event") : current.getString("title"),
            "information", current == null ? "" : nullToEmpty(current.getString("information")),
            "image", current == null ? null : presentationAsset(eventId, "overview", current.get("image", Document.class)),
            "schedule", doc(
                "startDate", event.getDate("startDate"),
                "endDate", event.getDate("endDate"),
                "startTime", event.getString("startTime"),
                "endTime", event.getString("endTime")
            ),
            "role", member.role(),
            "canEdit", member.canEditEventContent()
        );
        return result(true, output);
    }

    public Document saveOverview(String eventId, String user, Map<String, Object> body) {
        EventAccessService.Membership member = editor(eventId, user);
        String title = requiredText(body.get("title"), "title", 140);
        String information = optionalText(body.get("information"), "information", 12_000);
        Document image = body.containsKey("image") ? savedAsset(eventId, "overview", body.get("image")) : null;
        Date now = new Date();
        Document set = doc("title", title, "information", information, "status", "Active", "updatedAt", now,
            "updatedBy", doc("user", user, "userName", member.userName()));
        if (body.containsKey("image")) set.put("image", image);
        store.update("event_overview", doc("eventId", eventId),
            doc("$set", set, "$setOnInsert", doc("eventId", eventId, "createdAt", now)), true);
        store.update("events", doc("_id", access.objectId(eventId), "status", doc("$ne", "Inactive")),
            doc("$set", doc("event", title, "updatedAt", now)), false);
        invalidateEventCaches(eventId);
        return overview(eventId, user);
    }

    public Document destination(String eventId, String user) {
        EventAccessService.Membership member = access.requireMember(eventId, user);
        Document current = store.one("event_destination", activeEvent(eventId));
        return result(true, doc(
            "destination", current == null ? null : locationForResponse(current.get("location", Document.class)),
            "role", member.role(), "canEdit", member.canEditEventContent()
        ));
    }

    public Document saveDestination(String eventId, String user, Map<String, Object> body) {
        EventAccessService.Membership member = editor(eventId, user);
        Document location = location(body.get("location"));
        Date now = new Date();
        store.update("event_destination", doc("eventId", eventId), doc(
            "$set", doc("location", location, "status", "Active", "updatedAt", now,
                "updatedBy", doc("user", user, "userName", member.userName())),
            "$setOnInsert", doc("eventId", eventId, "createdAt", now)
        ), true);
        return destination(eventId, user);
    }

    public Document landmarks(String eventId, String user) {
        EventAccessService.Membership member = access.requireMember(eventId, user);
        List<Document> records = store.find("event_landmarks", activeEvent(eventId), doc("createdAt", 1));
        List<Document> items = new ArrayList<>();
        for (Document record : records) items.add(landmarkForResponse(eventId, record));
        return result(true, doc("items", items, "role", member.role(), "canEdit", member.canEditEventContent()));
    }

    public Document createLandmark(String eventId, String user, Map<String, Object> body) {
        EventAccessService.Membership member = editor(eventId, user);
        Date now = new Date();
        Document landmark = store.insert("event_landmarks", doc(
            "eventId", eventId,
            "title", requiredText(body.get("title"), "title", 120),
            "information", optionalText(body.get("information"), "information", 4_000),
            "location", optionalLocation(body.get("location")),
            "image", body.containsKey("image") ? savedAsset(eventId, "landmark", body.get("image")) : null,
            "status", "Active",
            "createdAt", now,
            "updatedAt", now,
            "createdBy", doc("user", user, "userName", member.userName()),
            "updatedBy", doc("user", user, "userName", member.userName())
        ));
        return result(true, landmarkForResponse(eventId, landmark));
    }

    public Document updateLandmark(String eventId, String landmarkId, String user, Map<String, Object> body) {
        EventAccessService.Membership member = editor(eventId, user);
        ObjectId id = objectId(landmarkId, "landmark");
        Document current = store.one("event_landmarks", doc("_id", id, "eventId", eventId, "status", doc("$ne", "Inactive")));
        if (current == null) throw problem(404, "Landmark not found");
        Document set = doc("updatedAt", new Date(), "updatedBy", doc("user", user, "userName", member.userName()));
        if (body.containsKey("title")) set.put("title", requiredText(body.get("title"), "title", 120));
        if (body.containsKey("information")) set.put("information", optionalText(body.get("information"), "information", 4_000));
        if (body.containsKey("location")) set.put("location", optionalLocation(body.get("location")));
        if (body.containsKey("image")) set.put("image", savedAsset(eventId, "landmark", body.get("image")));
        store.update("event_landmarks", doc("_id", id, "eventId", eventId), doc("$set", set), false);
        return result(true, landmarkForResponse(eventId, store.one("event_landmarks", doc("_id", id))));
    }

    public Document deleteLandmarks(String eventId, String user, Map<String, Object> body) {
        editor(eventId, user);
        if (!(body.get("ids") instanceof List<?> values) || values.isEmpty() || values.size() > MAX_LANDMARK_DELETE_ITEMS) {
            throw problem(400, "Select between 1 and 100 landmarks to delete");
        }
        List<ObjectId> ids = new ArrayList<>();
        for (Object value : values) {
            if (!(value instanceof String id)) throw problem(400, "Each landmark id must be a string");
            ids.add(objectId(id, "landmark"));
        }
        long changed = store.updateMany("event_landmarks", doc("eventId", eventId, "_id", doc("$in", ids), "status", doc("$ne", "Inactive")),
            doc("$set", doc("status", "Inactive", "inactiveAt", new Date(), "updatedAt", new Date())));
        return result(true, doc("inactiveCount", changed));
    }

    public Document createAssetIntent(String eventId, String user, Map<String, Object> body) {
        editor(eventId, user);
        requireCloudinary();
        String kind = assetKind(body.get("kind"));
        String mimeType = requiredText(body.get("mimeType"), "mimeType", 150);
        if (!mimeType.startsWith("image/")) throw problem(400, "Only images can be used here");
        long bytes = positiveLong(body.get("bytes"), "bytes");
        if (bytes > MAX_IMAGE_BYTES) throw problem(400, "Images must be 5 MB or smaller");
        String assetId = UUID.randomUUID().toString();
        long timestamp = Instant.now().getEpochSecond();
        String publicId = publicId(eventId, kind, assetId);
        String assetFolder = assetFolder(eventId, kind);
        Map<String, Object> parameters = new LinkedHashMap<>();
        parameters.put("public_id", publicId);
        parameters.put("asset_folder", assetFolder);
        parameters.put("timestamp", timestamp);
        parameters.put("type", "authenticated");
        parameters.put("overwrite", false);
        return result(true, doc(
            "assetId", assetId,
            "uploadUrl", "https://api.cloudinary.com/v1_1/" + cloudinarySettings.cloudName() + "/image/upload",
            "apiKey", cloudinarySettings.apiKey(), "timestamp", timestamp,
            "signature", cloudinary.apiSignRequest(parameters, cloudinarySettings.apiSecret(), cloudinary.config.signatureVersion),
            "publicId", publicId, "assetFolder", assetFolder, "type", "authenticated", "overwrite", false
        ));
    }

    public Document completeAsset(String eventId, String assetId, String user, Map<String, Object> body) {
        editor(eventId, user);
        requireCloudinary();
        String kind = assetKind(body.get("kind"));
        String publicId = publicId(eventId, kind, assetId);
        try {
            Map<?, ?> resource = cloudinary.api().resource(publicId, ObjectUtils.asMap("resource_type", "image", "type", "authenticated"));
            if (!publicId.equals(String.valueOf(resource.get("public_id")))) throw problem(502, "Cloudinary returned a different image asset");
            Document asset = doc("id", assetId, "publicId", publicId, "assetId", stringValue(resource.get("asset_id")),
                "version", resource.get("version"), "format", stringValue(resource.get("format")), "bytes", resource.get("bytes"),
                "width", resource.get("width"), "height", resource.get("height"));
            Date now = new Date();
            store.update("event_assets", doc("eventId", eventId, "kind", kind, "asset.id", assetId), doc(
                "$set", doc("asset", asset, "status", "Active", "updatedAt", now),
                "$setOnInsert", doc("eventId", eventId, "kind", kind, "createdAt", now)
            ), true);
            return result(true, presentationAsset(eventId, kind, asset));
        } catch (ApiException error) {
            throw error;
        } catch (Exception error) {
            throw problem(502, "Cloudinary could not verify the image upload");
        }
    }

    public void streamAsset(String eventId, String kind, String assetId, String token, HttpServletResponse response) {
        try {
            kind = assetKind(kind);
            deliveryTokens.verifyResource(token, eventId, "content:" + kind + ":" + assetId);
            Document owner = "overview".equals(kind)
                ? store.one("event_overview", doc("eventId", eventId, "status", doc("$ne", "Inactive"), "image.id", assetId))
                : store.one("event_landmarks", doc("eventId", eventId, "status", doc("$ne", "Inactive"), "image.id", assetId));
            if (owner == null) throw problem(404, "Image not found");
            Document image = owner.get("image", Document.class);
            String sourceUrl = cloudinary.url().resourceType("image").type("authenticated").secure(true).signed(true)
                .generate(image.getString("publicId"));
            HttpResponse<InputStream> source = http.send(HttpRequest.newBuilder(URI.create(sourceUrl)).GET().build(), HttpResponse.BodyHandlers.ofInputStream());
            response.setStatus(source.statusCode());
            copyHeader(source, response, "Content-Type");
            copyHeader(source, response, "Content-Length");
            response.setHeader("Cache-Control", "private, max-age=60");
            try (InputStream input = source.body()) { input.transferTo(response.getOutputStream()); }
        } catch (ApiException error) {
            throw error;
        } catch (InterruptedException error) {
            Thread.currentThread().interrupt();
            throw problem(502, "Image delivery was interrupted");
        } catch (Exception error) {
            throw problem(403, "Image link is invalid or has expired");
        }
    }

    private EventAccessService.Membership editor(String eventId, String user) {
        EventAccessService.Membership member = access.requireMember(eventId, user);
        if (!member.canEditEventContent()) throw problem(403, "Only hosts and managers can edit this event content");
        return member;
    }

    private Document activeEvent(String eventId) {
        return doc("eventId", eventId, "status", doc("$ne", "Inactive"));
    }

    private Document landmarkForResponse(String eventId, Document record) {
        return doc("id", record.getObjectId("_id").toHexString(), "title", record.getString("title"),
            "information", nullToEmpty(record.getString("information")), "location", locationForResponse(record.get("location", Document.class)),
            "image", presentationAsset(eventId, "landmark", record.get("image", Document.class)));
    }

    private Document savedAsset(String eventId, String kind, Object raw) {
        if (raw == null) return null;
        if (!(raw instanceof Map<?, ?> map) || !(map.get("id") instanceof String id) || id.isBlank()) throw problem(400, "Invalid image asset");
        Document stored = store.one("event_assets", doc("eventId", eventId, "kind", kind, "asset.id", id, "status", doc("$ne", "Inactive")));
        if (stored == null) throw problem(400, "The selected image was not uploaded for this event");
        return stored.get("asset", Document.class);
    }

    private Document presentationAsset(String eventId, String kind, Document asset) {
        if (asset == null) return null;
        String id = asset.getString("id");
        return doc("id", id, "width", asset.get("width"), "height", asset.get("height"), "bytes", asset.get("bytes"),
            "deliveryPath", "/api/events/" + eventId + "/content/" + kind + "/" + id + "?token=" +
                deliveryTokens.issueResource(eventId, "content:" + kind + ":" + id));
    }

    private Document locationForResponse(Document location) {
        return location == null ? null : new Document(location);
    }

    private Document optionalLocation(Object raw) {
        return raw == null ? null : location(raw);
    }

    private Document location(Object raw) {
        if (!(raw instanceof Map<?, ?> map)) throw problem(400, "location is required");
        String formattedAddress = requiredText(map.get("formattedAddress"), "location.formattedAddress", 500);
        Number latitude = number(map.get("latitude"), "location.latitude");
        Number longitude = number(map.get("longitude"), "location.longitude");
        if (latitude.doubleValue() < -90 || latitude.doubleValue() > 90 || longitude.doubleValue() < -180 || longitude.doubleValue() > 180) {
            throw problem(400, "location coordinates are invalid");
        }
        Document location = doc("formattedAddress", formattedAddress, "latitude", latitude.doubleValue(), "longitude", longitude.doubleValue());
        if (map.get("placeId") instanceof String placeId && !placeId.isBlank()) location.put("placeId", placeId);
        return location;
    }

    private String assetKind(Object raw) {
        if (raw instanceof String kind && ASSET_KINDS.contains(kind)) return kind;
        throw problem(400, "kind must be overview or landmark");
    }

    private String publicId(String eventId, String kind, String assetId) {
        return "eventseasy/events/" + eventId + "/" + cloudinaryFolderKind(kind) + "/" + assetId;
    }

    private String assetFolder(String eventId, String kind) {
        return "eventseasy/events/" + eventId + "/" + cloudinaryFolderKind(kind);
    }

    /** Keeps the API's singular resource name while using a conventional plural Cloudinary folder. */
    private String cloudinaryFolderKind(String kind) {
        return "landmark".equals(kind) ? "landmarks" : kind;
    }

    private void requireCloudinary() {
        if (!cloudinarySettings.configured()) throw problem(503, "Cloudinary media is not configured");
    }

    private static String requiredText(Object value, String field, int max) {
        if (!(value instanceof String text) || text.trim().isEmpty()) throw problem(400, field + " is required");
        String normalized = text.trim();
        if (normalized.length() > max) throw problem(400, field + " is too long");
        return normalized;
    }

    private static String optionalText(Object value, String field, int max) {
        if (value == null) return "";
        if (!(value instanceof String text)) throw problem(400, field + " must be text");
        String normalized = text.trim();
        if (normalized.length() > max) throw problem(400, field + " is too long");
        return normalized;
    }

    private static Number number(Object value, String field) {
        if (value instanceof Number number) return number;
        throw problem(400, field + " is required");
    }

    private static long positiveLong(Object value, String field) {
        if (value instanceof Number number && number.longValue() > 0) return number.longValue();
        throw problem(400, field + " must be a positive number");
    }

    private static ObjectId objectId(String value, String label) {
        try { return new ObjectId(value); }
        catch (IllegalArgumentException error) { throw problem(400, "Invalid " + label + " identifier"); }
    }

    private static String stringValue(Object value) {
        return value == null ? null : String.valueOf(value);
    }

    private static String nullToEmpty(String value) {
        return value == null ? "" : value;
    }

    private static ApiException problem(int status, String message) {
        return new ApiException(status, doc("statusCode", status, "message", message));
    }

    private static void copyHeader(HttpResponse<?> source, HttpServletResponse target, String name) {
        source.headers().firstValue(name).ifPresent(value -> target.setHeader(name, value));
    }

    private void invalidateEventCaches(String eventId) {
        for (Document viewer : store.find("viewers", doc("eventId", eventId, "status", doc("$ne", "Inactive")))) {
            String user = viewer.getString("user");
            if (user != null) redis.delete(user);
        }
    }
}
