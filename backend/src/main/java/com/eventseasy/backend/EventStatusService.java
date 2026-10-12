package com.eventseasy.backend;

import jakarta.annotation.PostConstruct;
import org.bson.Document;
import org.springframework.stereotype.Service;

import java.util.List;

import static com.eventseasy.backend.Values.doc;

/** Adds lifecycle state to legacy event-scoped records without touching global users. */
@Service
public class EventStatusService {
    private static final List<String> EVENT_COLLECTIONS = List.of(
        "events", "attendants", "viewers", "event_media", "event_assets", "event_overview",
        "event_destination", "event_landmarks", "chats", "chat_restricted_users", "chat_messages"
    );

    private final MongoStore store;

    public EventStatusService(MongoStore store) {
        this.store = store;
    }

    @PostConstruct
    void addStatusToExistingEventRecords() {
        for (String collection : EVENT_COLLECTIONS) {
            store.updateMany(collection, doc("status", doc("$exists", false)),
                doc("$set", doc("status", "Active")));
        }
    }

    public List<String> collections() {
        return EVENT_COLLECTIONS;
    }
}
