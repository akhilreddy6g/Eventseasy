package com.eventseasy.backend;

import org.bson.Document;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

import static com.eventseasy.backend.Values.doc;
import static com.eventseasy.backend.Values.result;

/** Performs reversible event/member removal; Cloudinary destruction remains an explicit media operation. */
@Service
public class EventLifecycleService {
    private final MongoStore store;
    private final EventAccessService access;
    private final EventStatusService statuses;
    private final StringRedisTemplate redis;

    public EventLifecycleService(MongoStore store, EventAccessService access, EventStatusService statuses,
                                 StringRedisTemplate redis) {
        this.store = store;
        this.access = access;
        this.statuses = statuses;
        this.redis = redis;
    }

    public Document deactivateEvent(String eventId, String user) {
        access.requireHost(eventId, user);
        List<Document> viewers = store.find("viewers", doc("eventId", eventId, "status", doc("$ne", "Inactive")));
        Date now = new Date();
        store.update("events", doc("_id", access.objectId(eventId), "user", user),
            doc("$set", doc("status", "Inactive", "inactiveAt", now, "updatedAt", now)), false);
        for (String collection : statuses.collections()) {
            if ("events".equals(collection)) continue;
            store.updateMany(collection, doc("eventId", eventId, "status", doc("$ne", "Inactive")),
                doc("$set", doc("status", "Inactive", "inactiveAt", now, "updatedAt", now)));
        }
        for (Document viewer : viewers) {
            String member = viewer.getString("user");
            if (member != null) redis.delete(member);
        }
        redis.delete(user);
        return result(true, "The event and all of its data have been marked inactive");
    }

    public Document leaveEvent(String eventId, String user) {
        EventAccessService.Membership membership = access.requireMember(eventId, user);
        if (membership.isHost()) throw problem(400, "Hosts must delete the event instead of exiting it");
        Date now = new Date();
        store.update("attendants", doc("eventId", eventId, "user", user, "status", doc("$ne", "Inactive")),
            doc("$set", doc("access", false, "status", "Inactive", "inactiveAt", now, "updatedAt", now)), false);
        store.updateMany("viewers", doc("eventId", eventId, "user", user, "status", doc("$ne", "Inactive")),
            doc("$set", doc("status", "Inactive", "inactiveAt", now, "updatedAt", now)));
        store.updateMany("event_media", doc("eventId", eventId, "uploader.user", user, "status", doc("$ne", "Inactive")),
            doc("$set", doc("status", "Inactive", "inactiveAt", now, "updatedAt", now,
                "uploader.status", "Inactive", "uploader.removedAt", now)));
        redis.delete(user);
        return result(true, "You have exited the event and your event-specific data is inactive");
    }

    private static ApiException problem(int status, String message) {
        return new ApiException(status, doc("statusCode", status, "message", message));
    }
}
