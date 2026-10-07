package com.eventseasy.backend;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.bson.Document;
import org.junit.jupiter.api.Test;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import static com.eventseasy.backend.Values.*;

class ChatServiceTest {
    MongoStore store = mock(MongoStore.class);
    KafkaGateway kafka = mock(KafkaGateway.class);
    ChatService chats = new ChatService(store, kafka, new ObjectMapper());
    @Test void nonMemberCannotCreateChat() {
        assertEquals(result(false, "Unable to create the chat - user doesn't have privileges"), chats.create(doc("eventId", "e"), "a@example.com"));
        verify(store, never()).insert(anyString(), any());
    }
    @Test void noMessagesIsSuccessfulStringResponse() {
        when(store.aggregate(eq("chat_messages"), any())).thenReturn(List.of());
        assertEquals(result(true, "No messages found"), chats.messages("e", "c"));
    }
    @Test void routesToServerAssignedToSamePartition() throws Exception {
        when(kafka.subscribers()).thenReturn(List.of(doc("clientId", "server", "partition", 0)));
        when(store.one("chat_servers", doc("csClientId", "server"))).thenReturn(doc("csApiUrl", "http://localhost:8080"));
        assertEquals(result(true, "http://localhost:8080"), chats.connection("e", "c"));
    }
    @Test void messagePayloadKeepsFieldsAndUsesNewUuid() throws Exception {
        var data = doc("eventId", "e", "chatId", "c", "user", "a@example.com", "username", "Akhil", "message", "Hello", "timestamp", "2026-10-04T10:00:00.000Z");
        Document response = chats.push(data);
        assertTrue(success(response)); UUID.fromString(response.getString("response"));
        var capture = org.mockito.ArgumentCaptor.forClass(String.class);
        verify(kafka).send(eq("e"), eq("c"), capture.capture());
        Document payload = Document.parse(capture.getValue());
        assertEquals(response.get("response"), payload.remove("messageId")); assertEquals(data, payload);
    }
    @Test void kafkaFailurePreservesResponsePrefix() throws Exception {
        doThrow(new IllegalStateException("offline")).when(kafka).send(any(), any(), any());
        assertEquals(result(false, "Error while pushing message to the queue: offline"), chats.push(doc("eventId", "e", "chatId", "c")));
    }
}
