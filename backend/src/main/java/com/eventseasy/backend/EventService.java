package com.eventseasy.backend;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.bson.Document;
import org.bson.types.ObjectId;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import java.time.*;
import java.util.*;
import static com.eventseasy.backend.Values.*;

@Service
public class EventService {
    private final MongoStore store;
    private final StringRedisTemplate redis;
    private final ObjectMapper json;
    private final InviteService invites;
    public EventService(MongoStore store, StringRedisTemplate redis, ObjectMapper json, InviteService invites) {
        this.store = store; this.redis = redis; this.json = json; this.invites = invites;
    }
    private Document identity(Map<String, ?> data) { return pick(data, "user", "accType", "eventId"); }
    private boolean viewer(Map<String, ?> data, String eventId) {
        try {
            Document key = pick(data, "user", "accType"); key.put("eventId", eventId);
            Document insert = new Document(key); insert.put("createdAt", new Date());
            store.update("viewers", key, doc("$setOnInsert", insert, "$set", doc("updatedAt", new Date())), true);
            return true;
        } catch (Exception e) {
            LogInfoService.Logger("Insert into Viewers Service", "events service -> insertIntoViewers", false, true,
                "Error while inserting the event into viewers", e);
            return false;
        }
    }
    public Document host(Map<String, Object> data) {
        Document event;
        try {
            event = pick(data, "startDate", "endDate", "startTime", "endTime", "user", "accType", "event");
            for (String field : List.of("startDate", "endDate")) event.put(field, date(str(data, field)));
            event = store.insert("events", event);
        } catch (Exception e) {
            LogInfoService.Logger("Host Event Insertion Service", "events service -> insertEvent", false, true,
                "Error inserting a host event", e);
            LogInfoService.Logger("Host Event Service", "events service -> hostEvent", false, true,
                "Failed to create an event for host", "none");
            return result(false, "Request failed, please enter all the required information");
        }
        try {
            boolean result1 = viewer(data, event.getObjectId("_id").toHexString());
            if (result1) {
                LogInfoService.Logger("Host Event Service", "events service -> hostEvent", false, true,
                    "Created an event and recorded it in viewers", "none");
            } else {
                LogInfoService.Logger("Host Event Service", "events service -> hostEvent", false, true,
                    "Created an event but couldn't record it in viewers", "none");
            }
            return result(true, "successfully created an event for the host");
        } catch (Exception e) {
            LogInfoService.Logger("Host Event Service", "events service -> hostEvent", false, true,
                "Error while insering record into viewers", e);
            return result(false, e);
        }
    }
    private Date date(String value) {
        try { return Date.from(Instant.parse(value)); }
        catch (Exception e) { return Date.from(LocalDate.parse(value).atStartOfDay(ZoneOffset.UTC).toInstant()); }
    }
    public Document join(Map<String, Object> data) {
        try {
            Document filter = identity(data); filter.put("access", false);
            if (store.one("attendants", filter) == null) {
                LogInfoService.Logger("Attendant Verification Service", "events service -> verifyJoinee", false, true,
                    "Credentials unverifiable/ access already granted", "none");
                return result(false, "Event joined already/Invalid credentials");
            }
            try {
                store.update("attendants", identity(data), doc("$set", doc("access", true)), false);
                LogInfoService.Logger("Attendant Verification Service", "events service -> verifyJoinee", false, true,
                    "Attendant credentials verified and access granted", "none");
                try {
                    if (viewer(data, str(data, "eventId"))) {
                        LogInfoService.Logger("Attendant Verification Service", "events service -> verifyJoinee", false, true,
                            "Successfully recorded the change in viewers", "none");
                        return result(true, "Event joined successfully");
                    }
                    LogInfoService.Logger("Attendant Verification Service", "events service -> verifyJoinee", false, true,
                        "Failed to record the change in viewers", "none");
                    return result(false, "Event joined successfully, but couldn't record change in viewers");
                } catch (Exception e) {
                    LogInfoService.Logger("Attendant Verification Service", "events service -> verifyJoinee", false, true,
                        "Error while recording the change in viewers", e);
                    return result(false, "Event joined successfully, but faced errors while recording the change in viewers");
                }
            } catch (Exception e) {
                LogInfoService.Logger("Attendant Verification Service", "events service -> verifyJoinee", false, true,
                    "Error while verifying attendant credentials", e);
                return result(false, "Error while trying to join the event");
            }
        } catch (Exception e) {
            LogInfoService.Logger("Attendant Verification Service", "events service -> verifyJoinee", false, true,
                "Error while verifying joinee credentials", e);
            LogInfoService.Logger("Add Attendant Service", "events service -> joinEvent", false, true,
                "Error while verifying the joinee", e);
            return result(false, "Error while verifying joinee credentials");
        }
    }
    public Document attendees(String eventId, boolean managers) {
        String field = managers ? "response" : "data";
        try { return doc("success", true, field, store.find("attendants", doc("eventId", eventId, "accType", managers ? "Manage" : "Attend"))); }
        catch (Exception e) {
            LogInfoService.Logger(managers ? "Event Managers Info Service" : "Event Guests Info Service",
                managers ? "events service -> eventManagers" : "events service -> eventGuests", true, false,
                managers ? "Error fetching event managers" : "Error fetching event guests", e);
            return doc("success", false, field, null);
        }
    }
    public Object delete(Map<String, Object> data, String host) {
        try {
            if (store.one("events", doc("user", host, "_id", new ObjectId(str(data, "eventId")))) != null) {
                long first = store.delete("attendants", identity(data));
                long second = store.delete("viewers", identity(data));
                if (first > 0 && second > 0) return result(true, "Succeessfully deleted the user from the event");
            }
            return result(false, "Unable to delete the user from one of the documents/user doesn't have privileges");
        } catch (Exception e) {
            LogInfoService.Logger("Event User Deletion Service", "events service -> deleteUserFromEvent", true, false,
                "Error removing the user from the event", e);
            return null;
        }
    }
    public Document reinvite(Map<String, Object> data, String host) {
        try {
            Document event = store.one("events", doc("user", host, "_id", new ObjectId(str(data, "eventId"))));
            if (event == null) return result(false, "Unable to reinvite the user/user doesn't have privileges");
            Document body = pick(data, "username", "user", "hostName", "eventId", "accType", "access", "message");
            body.put("eventName", event.get("event")); body.put("flag", true);
            return invites.send(body);
        } catch (Exception e) {
            LogInfoService.Logger("Reinvite User Service", "events service -> reInviteUser", false, true,
                "Error reinviting the user to the event", e);
            return result(false, "Error reinviting user to the event");
        }
    }
    public Document userData(Map<String, Object> query) {
        try {
            String user = str(query, "user");
            String cached = redis.opsForValue().get(user);
            if (cached != null) {
                Document value = json.readValue(cached, Document.class);
                if (Objects.equals(value.get("redisStatus"), query.get("status")) && value.get("redisData") != null) {
                    LogInfoService.Logger("User Data Retrieval Service", "events service -> userData", true, false,
                        "User data retrieval from redis successful", "none");
                    return result(true, value.get("redisData"));
                }
            }
            List<Document> pipeline = List.of(doc("$match", doc("user", user)), doc("$lookup", doc(
                "from", "events", "let", doc("eventIdStr", "$eventId"), "pipeline", List.of(
                    doc("$match", doc("$expr", doc("$eq", List.of("$_id", doc("$toObjectId", "$$eventIdStr"))))),
                    doc("$project", doc("event", 1))), "as", "eventData")));
            List<Document> data = store.aggregate("viewers", pipeline);
            Document value = doc("redisData", data, "ttl", 900);
            if (query.containsKey("status")) value.put("redisStatus", query.get("status"));
            // Original passes ttl inside the value, never as RedisService.set's third argument.
            try { redis.opsForValue().set(user, json.writeValueAsString(value)); } catch (Exception ignored) { }
            LogInfoService.Logger("User Data Retrieval Service", "users service -> userData", true, false,
                "User data retrieval from db successful", "none");
            return result(true, data);
        } catch (Exception e) {
            LogInfoService.Logger("User Data Retrieval Service", "users service -> userData", true, false,
                "Error retrieving user data", e);
            return result(false, null);
        }
    }
    public Document users(String eventId) {
        try {
            List<Document> users = store.aggregate("attendants", List.of(doc("$match", doc("eventId", eventId)),
                doc("$project", doc("user", 1, "userName", 1, "accType", 1))));
            LogInfoService.Logger("Event Users Retrieval Service", "users service -> eventUsers", true, false,
                "Event users retrieved successfully", "none");
            return result(true, users);
        } catch (Exception e) {
            LogInfoService.Logger("eventUsers", "users service -> eventUsers", true, false,
                "Error retrieving event users", e);
            return result(false, null);
        }
    }
}