package com.eventseasy.backend;

import org.bson.Document;
import org.bson.types.ObjectId;
import org.springframework.stereotype.Service;

import static com.eventseasy.backend.Values.doc;

/** Central role check for event-scoped features. */
@Service
public class EventAccessService {
    private final MongoStore store;

    public EventAccessService(MongoStore store) {
        this.store = store;
    }

    public Membership requireMember(String eventId, String user) {
        ObjectId id = objectId(eventId);
        Document hosted = store.one("events", doc("_id", id, "user", user, "status", doc("$ne", "Inactive")));
        if (hosted != null) return new Membership("Host", nameFor(user));

        Document attendant = store.one("attendants", doc(
            "eventId", eventId, "user", user, "access", true, "status", doc("$ne", "Inactive")));
        if (attendant == null) throw problem(403, "You are not an active member of this event");
        String role = attendant.getString("accType");
        if (!"Manage".equals(role) && !"Attend".equals(role)) {
            throw problem(403, "You do not have access to this event");
        }
        String name = attendant.getString("userName");
        return new Membership(role, name == null || name.isBlank() ? user : name);
    }

    public void requireHost(String eventId, String user) {
        Membership membership = requireMember(eventId, user);
        if (!membership.isHost()) throw problem(403, "Only the event host can perform this action");
    }

    public ObjectId objectId(String value) {
        try {
            return new ObjectId(value);
        } catch (IllegalArgumentException error) {
            throw problem(400, "Invalid event identifier");
        }
    }

    private String nameFor(String user) {
        Document account = store.one("users", doc("user", user));
        String name = account == null ? null : account.getString("username");
        return name == null || name.isBlank() ? user : name;
    }

    private static ApiException problem(int status, String message) {
        return new ApiException(status, doc("statusCode", status, "message", message));
    }

    public record Membership(String role, String userName) {
        public boolean canEditEventContent() {
            return "Host".equals(role) || "Manage".equals(role);
        }

        public boolean isHost() {
            return "Host".equals(role);
        }
    }
}
