package com.eventseasy.backend;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.bson.Document;
import org.bson.types.ObjectId;
import org.junit.jupiter.api.Test;
import org.springframework.data.redis.core.*;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import static com.eventseasy.backend.Values.*;

class EventServiceTest {
    MongoStore store = mock(MongoStore.class);
    StringRedisTemplate redis = mock(StringRedisTemplate.class);
    InviteService invites = mock(InviteService.class);
    EventService events = new EventService(store, redis, new ObjectMapper(), invites);
    @Test void hostWritesOnlyOriginalFieldsAndStringViewerId() {
        ObjectId id = new ObjectId();
        when(store.insert(eq("events"), any())).thenAnswer(call -> { Document d = call.getArgument(1); d.put("_id", id); return d; });
        var body = doc("startDate", "2026-10-04", "endDate", "2026-10-05", "startTime", "10:00", "endTime", "12:00", "user", "a@example.com", "accType", "Host", "event", "Party", "extra", "ignored");
        assertEquals(result(true, "successfully created an event for the host"), events.host(body));
        verify(store).insert(eq("events"), argThat(d -> d.get("startDate") instanceof Date && !d.containsKey("extra")));
        verify(store).update(eq("viewers"), eq(doc("user", "a@example.com", "accType", "Host", "eventId", id.toHexString())), any(), eq(true));
    }
    @Test void joiningRequiresPendingInvitation() {
        var data = doc("user", "a@example.com", "eventId", "e", "accType", "Attend");
        assertEquals(result(false, "Event joined already/Invalid credentials"), events.join(data));
        when(store.one(eq("attendants"), any())).thenReturn(data);
        assertEquals(result(true, "Event joined successfully"), events.join(data));
        verify(store).update(eq("attendants"), eq(data), eq(doc("$set", doc("access", true))), eq(false));
    }
    @Test void guestsAndManagersKeepDifferentResponseKeys() {
        when(store.find(eq("attendants"), any())).thenReturn(List.of());
        assertEquals(doc("success", true, "data", List.of()), events.attendees("e", false));
        assertEquals(doc("success", true, "response", List.of()), events.attendees("e", true));
    }
    @Test void deletionRequiresHostAndBothRecords() {
        var data = doc("user", "a@example.com", "eventId", new ObjectId().toHexString(), "accType", "Attend");
        assertFalse(success((Document) events.delete(data, "host@example.com")));
        verify(store, never()).delete(anyString(), any());
        when(store.one(eq("events"), any())).thenReturn(doc("event", "Party"));
        when(store.delete(anyString(), any())).thenReturn(1L);
        assertEquals(result(true, "Succeessfully deleted the user from the event"), events.delete(data, "host@example.com"));
    }
    @Test void matchingRedisStatusReturnsCachedValue() {
        @SuppressWarnings("unchecked") ValueOperations<String, String> values = mock(ValueOperations.class);
        when(redis.opsForValue()).thenReturn(values);
        when(values.get("a@example.com")).thenReturn("{\"redisStatus\":\"0\",\"redisData\":[]}");
        assertEquals(result(true, List.of()), events.userData(doc("user", "a@example.com", "status", "0")));
        verify(store, never()).aggregate(anyString(), any());
    }
}
