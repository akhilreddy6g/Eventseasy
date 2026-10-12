package com.eventseasy.backend;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import jakarta.annotation.PostConstruct;
import jakarta.servlet.http.HttpServletResponse;
import org.bson.Document;
import org.bson.types.ObjectId;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import static com.eventseasy.backend.Values.doc;
import static com.eventseasy.backend.Values.result;

/**
 * Owns the event_media collection and the server-side parts of Cloudinary's
 * direct-upload flow. Cloudinary secrets and original delivery URLs never
 * leave this service.
 */
@Service
public class MediaService {
    private static final String COLLECTION = "event_media";
    private static final int MAX_UPLOAD_INTENTS = 10;
    private static final int MAX_DELETE_ITEMS = 100;
    private static final long MAX_IMAGE_BYTES = 5L * 1024 * 1024;
    private static final long MAX_VIDEO_BYTES = 40L * 1024 * 1024;

    private final MongoStore store;
    private final Cloudinary cloudinary;
    private final CloudinarySettings cloudinarySettings;
    private final MediaTokenService deliveryTokens;
    private final HttpClient http = HttpClient.newBuilder().followRedirects(HttpClient.Redirect.NORMAL).build();

    public MediaService(MongoStore store, Cloudinary cloudinary, CloudinarySettings cloudinarySettings,
                        MediaTokenService deliveryTokens) {
        this.store = store;
        this.cloudinary = cloudinary;
        this.cloudinarySettings = cloudinarySettings;
        this.deliveryTokens = deliveryTokens;
    }

    @PostConstruct
    void createIndexes() {
        // Covers the gallery query and the removal/tombstone update respectively.
        store.ensureIndex(COLLECTION,
            doc("eventId", 1, "mediaType", 1, "uploadStatus", 1, "uploader.userName", 1, "createdAt", 1),
            "event_media_gallery");
        store.ensureIndex(COLLECTION, doc("eventId", 1, "uploader.user", 1), "event_media_uploader");
    }

    public Document list(String eventId, String user, String requestedType) {
        Membership member = membership(eventId, user);
        String mediaType = mediaType(requestedType);
        List<Document> records = store.find(COLLECTION,
            doc("eventId", eventId, "mediaType", mediaType, "uploadStatus", "Ready", "status", doc("$ne", "Inactive")),
            doc("uploader.userName", 1, "createdAt", 1));

        List<Document> items = new ArrayList<>();
        for (Document record : records) {
            Document uploader = record.get("uploader", Document.class);
            String mediaId = record.getObjectId("_id").toHexString();
            Document item = doc(
                "id", mediaId,
                "mediaType", record.getString("mediaType"),
                "createdAt", record.getDate("createdAt"),
                "bytes", record.get("cloudinary", Document.class).get("bytes"),
                "width", record.get("cloudinary", Document.class).get("width"),
                "height", record.get("cloudinary", Document.class).get("height"),
                "durationSeconds", record.get("cloudinary", Document.class).get("durationSeconds"),
                "deliveryPath", "/api/events/" + eventId + "/media/" + mediaId + "/content?token=" + deliveryTokens.issue(eventId, mediaId),
                "canDelete", canDelete(member, user, uploader),
                "isUploader", user.equals(uploader.getString("user"))
            );
            // Attendees deliberately do not receive an uploader identity, even after a member is removed.
            if (member.canSeeUploaderNames()) item.put("uploaderName", uploader.getString("userName"));
            items.add(item);
        }
        return result(true, doc("role", member.role(), "items", items));
    }

    public Document createUploadIntents(String eventId, String user, Map<String, Object> body) {
        Membership member = membership(eventId, user);
        requireCloudinary();
        List<?> files = listValue(body.get("files"), "files");
        if (files.isEmpty() || files.size() > MAX_UPLOAD_INTENTS) {
            throw problem(400, "Upload requests must contain between 1 and 10 files");
        }

        long timestamp = Instant.now().getEpochSecond();
        List<Document> intents = new ArrayList<>();
        for (Object rawFile : files) {
            if (!(rawFile instanceof Map<?, ?> rawMap)) throw problem(400, "Each file must include its type and size");
            String mimeType = requiredString(rawMap.get("mimeType"), "mimeType");
            long bytes = requiredBytes(rawMap.get("bytes"));
            String type = typeForMime(mimeType, bytes);

            Date now = new Date();
            Document media = store.insert(COLLECTION, doc(
                "eventId", eventId,
                "mediaType", type,
                "uploadStatus", "Uploading",
                "status", "Active",
                "uploader", doc(
                    "user", user,
                    "userName", member.userName(),
                    "roleAtUpload", member.role(),
                    "status", "Active",
                    "removedAt", null
                ),
                // This is filled only after the server confirms the actual Cloudinary asset.
                "cloudinary", doc(),
                "createdAt", now,
                "updatedAt", now
            ));
            String mediaId = media.getObjectId("_id").toHexString();
            String publicId = publicId(eventId, mediaId);
            String assetFolder = assetFolder(eventId);
            Map<String, Object> signedParameters = new LinkedHashMap<>();
            signedParameters.put("public_id", publicId);
            signedParameters.put("asset_folder", assetFolder);
            signedParameters.put("timestamp", timestamp);
            signedParameters.put("type", "authenticated");
            signedParameters.put("overwrite", false);

            intents.add(doc(
                "mediaId", mediaId,
                "uploadUrl", uploadUrl(type),
                "apiKey", cloudinarySettings.apiKey(),
                "timestamp", timestamp,
                "signature", cloudinary.apiSignRequest(
                    signedParameters,
                    cloudinarySettings.apiSecret(),
                    cloudinary.config.signatureVersion
                ),
                "publicId", publicId,
                "assetFolder", assetFolder,
                "resourceType", type,
                "type", "authenticated",
                "overwrite", false
            ));
        }
        return result(true, doc("items", intents));
    }

    public Document completeUpload(String eventId, String mediaId, String user) {
        Membership ignored = membership(eventId, user);
        requireCloudinary();
        Document media = readyForCompletion(eventId, mediaId, user);
        String resourceType = media.getString("mediaType");
        String publicId = publicId(eventId, mediaId);
        try {
            Map<?, ?> resource = cloudinary.api().resource(publicId,
                ObjectUtils.asMap("resource_type", resourceType, "type", "authenticated"));
            if (!publicId.equals(String.valueOf(resource.get("public_id")))) {
                throw problem(502, "Cloudinary returned a different media asset");
            }
            Document cloudinaryData = doc(
                "assetId", stringValue(resource.get("asset_id")),
                "publicId", publicId,
                "version", resource.get("version"),
                "format", stringValue(resource.get("format")),
                "bytes", resource.get("bytes"),
                "width", resource.get("width"),
                "height", resource.get("height"),
                "durationSeconds", "video".equals(resourceType) ? resource.get("duration") : null
            );
            store.update(COLLECTION, doc("_id", objectId(mediaId), "eventId", eventId, "uploadStatus", "Uploading", "status", doc("$ne", "Inactive")),
                doc("$set", doc("cloudinary", cloudinaryData, "uploadStatus", "Ready", "updatedAt", new Date())), false);
            return result(true, doc("id", mediaId));
        } catch (ApiException error) {
            throw error;
        } catch (Exception error) {
            throw problem(502, "Cloudinary could not verify the uploaded media");
        }
    }

    public Document delete(String eventId, String user, Map<String, Object> body) {
        Membership member = membership(eventId, user);
        requireCloudinary();
        List<?> values = listValue(body.get("ids"), "ids");
        if (values.isEmpty() || values.size() > MAX_DELETE_ITEMS) {
            throw problem(400, "Delete requests must contain between 1 and 100 items");
        }
        Set<String> requestedIds = new HashSet<>();
        for (Object value : values) requestedIds.add(requiredString(value, "id"));
        if (requestedIds.size() != values.size()) throw problem(400, "Media IDs must be unique");

        List<Document> records = new ArrayList<>();
        for (String id : requestedIds) {
            Document record = store.one(COLLECTION, doc("_id", objectId(id), "eventId", eventId, "uploadStatus", "Ready", "status", doc("$ne", "Inactive")));
            if (record == null || !canDelete(member, user, record.get("uploader", Document.class))) {
                throw problem(403, "You do not have permission to delete one or more selected items");
            }
            records.add(record);
        }

        List<String> deletedIds = new ArrayList<>();
        List<String> failedIds = new ArrayList<>();
        // One destroy call per item is deliberately conservative; the endpoint itself caps a request at 100.
        for (Document record : records) {
            String id = record.getObjectId("_id").toHexString();
            try {
                Map<?, ?> response = cloudinary.uploader().destroy(cloudinaryPublicId(record, eventId, id), ObjectUtils.asMap(
                    "resource_type", record.getString("mediaType"), "type", "authenticated", "invalidate", true));
                String cloudinaryResult = stringValue(response.get("result"));
                if ("ok".equals(cloudinaryResult) || "not found".equals(cloudinaryResult)) {
                    store.delete(COLLECTION, doc("_id", record.getObjectId("_id"), "eventId", eventId));
                    deletedIds.add(id);
                } else {
                    failedIds.add(id);
                }
            } catch (Exception ignored) {
                failedIds.add(id);
            }
        }
        return result(true, doc("deletedIds", deletedIds, "failedIds", failedIds));
    }

    public void stream(String eventId, String mediaId, String token, String range, HttpServletResponse response) {
        try {
            deliveryTokens.verify(token, eventId, mediaId);
            Document media = store.one(COLLECTION, doc("_id", objectId(mediaId), "eventId", eventId, "uploadStatus", "Ready", "status", doc("$ne", "Inactive")));
            if (media == null) throw problem(404, "Media not found");
            Document cloudinaryData = media.get("cloudinary", Document.class);
            String sourceUrl = cloudinary.url()
                .resourceType(media.getString("mediaType"))
                .type("authenticated")
                .secure(true)
                .signed(true)
                .generate(cloudinaryPublicId(media, eventId, mediaId));
            HttpRequest.Builder request = HttpRequest.newBuilder(URI.create(sourceUrl)).GET();
            if (range != null && !range.isBlank()) request.header("Range", range);
            HttpResponse<InputStream> source = http.send(request.build(), HttpResponse.BodyHandlers.ofInputStream());

            response.setStatus(source.statusCode());
            copyHeader(source, response, "Content-Type");
            copyHeader(source, response, "Content-Length");
            copyHeader(source, response, "Content-Range");
            copyHeader(source, response, "Accept-Ranges");
            response.setHeader("Cache-Control", "private, max-age=60");
            if (response.getContentType() == null && cloudinaryData != null) {
                response.setContentType("video".equals(media.getString("mediaType")) ? "video/*" : "image/*");
            }
            try (InputStream input = source.body()) {
                input.transferTo(response.getOutputStream());
            }
        } catch (ApiException error) {
            throw error;
        } catch (InterruptedException error) {
            Thread.currentThread().interrupt();
            throw problem(502, "Media delivery was interrupted");
        } catch (Exception error) {
            throw problem(403, "Media link is invalid or has expired");
        }
    }

    /** Called when a member exits or is removed; Cloudinary remains available to explicit cleanup only. */
    public void markUploaderInactive(String eventId, String user) {
        store.updateMany(COLLECTION,
            doc("eventId", eventId, "uploader.user", user, "status", doc("$ne", "Inactive")),
            doc("$set", doc("status", "Inactive", "inactiveAt", new Date(), "uploader.status", "Inactive",
                "uploader.removedAt", new Date(), "updatedAt", new Date())));
    }

    private Membership membership(String eventId, String user) {
        ObjectId id = objectId(eventId);
        Document hosted = store.one("events", doc("_id", id, "user", user, "status", doc("$ne", "Inactive")));
        if (hosted != null) {
            Document account = store.one("users", doc("user", user));
            String userName = account == null ? user : stringValue(account.get("username"));
            return new Membership("Host", userName == null || userName.isBlank() ? user : userName);
        }
        Document attendant = store.one("attendants", doc("eventId", eventId, "user", user, "access", true, "status", doc("$ne", "Inactive")));
        if (attendant == null) throw problem(403, "You are not an active member of this event");
        String role = attendant.getString("accType");
        if (!"Manage".equals(role) && !"Attend".equals(role)) throw problem(403, "You do not have media access for this event");
        String userName = attendant.getString("userName");
        return new Membership(role, userName == null || userName.isBlank() ? user : userName);
    }

    private Document readyForCompletion(String eventId, String mediaId, String user) {
        Document media = store.one(COLLECTION,
            doc("_id", objectId(mediaId), "eventId", eventId, "uploadStatus", "Uploading", "status", doc("$ne", "Inactive"), "uploader.user", user));
        if (media == null) throw problem(404, "Pending upload not found");
        return media;
    }

    private boolean canDelete(Membership member, String user, Document uploader) {
        if ("Host".equals(member.role())) return true;
        if (user.equals(uploader.getString("user"))) return true;
        return "Manage".equals(member.role()) && "Attend".equals(uploader.getString("roleAtUpload"));
    }

    private String mediaType(String requestedType) {
        if ("image".equals(requestedType) || "video".equals(requestedType)) return requestedType;
        throw problem(400, "type must be image or video");
    }

    private String typeForMime(String mimeType, long bytes) {
        if (mimeType.startsWith("image/") && bytes <= MAX_IMAGE_BYTES) return "image";
        if (mimeType.startsWith("video/") && bytes <= MAX_VIDEO_BYTES) return "video";
        if (mimeType.startsWith("image/")) throw problem(400, "Images must be 5 MB or smaller");
        if (mimeType.startsWith("video/")) throw problem(400, "Videos must be 40 MB or smaller");
        throw problem(400, "Only image and video files are allowed");
    }

    private String uploadUrl(String type) {
        return "https://api.cloudinary.com/v1_1/" + cloudinarySettings.cloudName() + "/" + type + "/upload";
    }

    private String publicId(String eventId, String mediaId) {
        return "eventseasy/events/" + eventId + "/media/" + mediaId;
    }

    private String assetFolder(String eventId) {
        return "eventseasy/events/" + eventId + "/media";
    }

    /** Old uploads predate the media subfolder; keep their stored delivery working during the migration. */
    private String cloudinaryPublicId(Document media, String eventId, String mediaId) {
        Document cloudinaryData = media.get("cloudinary", Document.class);
        if (cloudinaryData != null && cloudinaryData.getString("publicId") != null) return cloudinaryData.getString("publicId");
        return "eventseasy/events/" + eventId + "/" + mediaId;
    }

    private void requireCloudinary() {
        if (!cloudinarySettings.configured()) throw problem(503, "Cloudinary media is not configured");
    }

    private static List<?> listValue(Object value, String field) {
        if (value instanceof List<?> list) return list;
        throw problem(400, field + " must be an array");
    }

    private static String requiredString(Object value, String field) {
        if (value instanceof String string && !string.isBlank()) return string;
        throw problem(400, field + " is required");
    }

    private static long requiredBytes(Object value) {
        if (value instanceof Number number && number.longValue() > 0) return number.longValue();
        throw problem(400, "bytes must be a positive number");
    }

    private static ObjectId objectId(String value) {
        try {
            return new ObjectId(value);
        } catch (IllegalArgumentException error) {
            throw problem(400, "Invalid identifier");
        }
    }

    private static String stringValue(Object value) {
        return value == null ? null : String.valueOf(value);
    }

    private static ApiException problem(int status, String message) {
        return new ApiException(status, doc("statusCode", status, "message", message));
    }

    private static void copyHeader(HttpResponse<?> source, HttpServletResponse target, String name) {
        source.headers().firstValue(name).ifPresent(value -> target.setHeader(name, value));
    }

    private record Membership(String role, String userName) {
        boolean canSeeUploaderNames() {
            return "Host".equals(role) || "Manage".equals(role);
        }
    }
}
