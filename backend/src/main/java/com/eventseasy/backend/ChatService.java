package com.eventseasy.backend;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.bson.Document;
import org.bson.types.ObjectId;
import org.springframework.stereotype.Service;
import java.util.*;
import static com.eventseasy.backend.Values.*;

@Service
public class ChatService {
    private final MongoStore store;
    private final KafkaGateway kafka;
    private final ObjectMapper json;
    public ChatService(MongoStore store, KafkaGateway kafka, ObjectMapper json) { this.store = store; this.kafka = kafka; this.json = json; }
    private Document viewer(String user, String eventId) {
        try { return store.one("viewers", doc("user", user, "eventId", eventId)); } catch (Exception e) { return null; }
    }
    public Document create(Map<String, Object> data, String user) {
        try {
            if (viewer(user, str(data, "eventId")) == null) {
                LogInfoService.Logger("Chat Creation Service", "chats service -> createChat", false, true,
                    "Unable to create the chat - user doesn't have privileges", "none");
                return result(false, "Unable to create the chat - user doesn't have privileges");
            }
            Document chat = pick(data, "eventId", "chatName", "chatDescription", "chatType", "chatDate", "chatStartTime", "chatEndTime", "chatStatus", "restrictedUsers");
            chat = store.insert("chats", chat);
            for (Object restricted : (List<?>) data.get("restrictedUsers"))
                store.insert("chat_restricted_users", doc("eventId", data.get("eventId"), "chatId", chat.getObjectId("_id").toHexString(), "user", restricted));
            LogInfoService.Logger("Chat Creation Service", "chats service -> createChat", false, true,
                "User verified, and new chat created successfully", "none");
            return result(true, "Successfully created the chat");
        } catch (Exception e) {
            LogInfoService.Logger("Chat Creation Service", "chats service -> createChat", false, true,
                "Error while creating the chat", e);
            return result(false, error());
        }
    }
    public Document chats(String eventId, String user) {
        try {
            Document viewer = viewer(user, eventId);
            if (viewer != null) {
                boolean privileged = List.of("Host", "Manage").contains(viewer.getString("accType"));
                LogInfoService.Logger("Chat Info Retrieval Service", "chats service -> getChats", true, false,
                    "User verified successfully", "none");
                List<Document> data = store.aggregate("chats", List.of(
                    doc("$match", doc("eventId", eventId)),
                    doc("$lookup", doc("from", "chat_restricted_users", "let", doc("chatId", doc("$toString", "$_id"), "user", user),
                        "pipeline", List.of(doc("$match", doc("$expr", doc("$and", List.of(doc("$eq", List.of("$chatId", "$$chatId")), doc("$eq", List.of("$user", "$$user"))))))), "as", "matchingRecords")),
                    doc("$match", doc("matchingRecords", doc("$eq", List.of()))),
                    doc("$project", doc("_id", false, "chatId", "$_id", "chatName", true, "chatDescription", true, "chatType", true, "chatDate", true,
                        "chatStartTime", true, "chatEndTime", true, "chatStatus", true, "restrictedUsers", privileged ? "$restrictedUsers" : "$$REMOVE"))));
                if (!data.isEmpty()) return result(true, data);
                LogInfoService.Logger("Chat Info Retrieval Service", "chats service -> getChats", false, true,
                    "No chats found", "none");
            }
            LogInfoService.Logger("Chat Info Retrieval Service", "chats service -> getChats", false, true,
                "Failed to retrieve chats - user doesn't have privileges", "none");
            return result(false, "No chats found/ User doesn't have privileges");
        } catch (Exception e) {
            LogInfoService.Logger("Chat Info Retrieval Service", "chats service -> getChats", false, true,
                "Error while retrieving the event chats", e);
            return result(false, error());
        }
    }
    public Document start(String eventId, String chatId) {
        try {
            store.update("chats", doc("eventId", eventId, "_id", new ObjectId(chatId)), doc("$set", doc("chatStatus", true)), false);
            LogInfoService.Logger("Chat Activation Service", "chats service -> startChat", true, false,
                "Chat Activated Successfully", "none");
            return result(true, "Chat Activated successfully");
        } catch (Exception e) {
            LogInfoService.Logger("Chat Activation Service", "chats service -> startChat", true, false,
                "Unable to Activate Chat", e);
            return result(false, error());
        }
    }
    public Document subscribers() {
        try {
            List<Document> subscribers = kafka.subscribers();
            LogInfoService.Logger("Kafka Subscriber Info Service", "chats service -> getAllSubscribers", false, false,
                "Successfully fetched info of all kafka consumers", "none");
            return result(true, subscribers);
        } catch (Exception e) {
            LogInfoService.Logger("Kafka Subscriber Info Service", "chats service -> getAllSubscribers", false, false,
                "Error while fetching kafka consumers info", e);
            return result(false, "Error while fetching consumers: " + e.getMessage());
        }
    }
    public Document connection(String eventId, String chatId) {
        try {
            Document all = subscribers();
            if (!success(all) || !(all.get("response") instanceof List<?> items) || items.isEmpty())
                return result(false, "Unable to retrieve go server api url");
            int partition = KafkaGateway.computePartition(eventId, chatId, items.size());
            for (Object item : items) {
                Map<?, ?> assignment = (Map<?, ?>) item;
                if (Objects.equals(assignment.get("partition"), partition)) {
                    Document server = store.one("chat_servers", doc("csClientId", assignment.get("clientId")));
                    if (server == null) {
                        NullPointerException e = new NullPointerException("Cannot read properties of null (reading 'csApiUrl')");
                        LogInfoService.Logger("Websocket Connection Service", "chats service -> getNewWsConn", false, true,
                            "Error while getting go server api url", e);
                        return result(false, "Error while getting connection string: Cannot read properties of null (reading 'csApiUrl')");
                    }
                    LogInfoService.Logger("Websocket Connection Service", "chats service -> getNewWsConn", false, true,
                        "Successfully retrieved go server api url to establish websocket connection", "none");
                    return result(true, server.get("csApiUrl"));
                }
            }
            IndexOutOfBoundsException e = new IndexOutOfBoundsException("Cannot read properties of undefined (reading 'clientId')");
            LogInfoService.Logger("Websocket Connection Service", "chats service -> getNewWsConn", false, true,
                "Error while getting go server api url", e);
            return result(false, "Error while getting connection string: Cannot read properties of undefined (reading 'clientId')");
        } catch (Exception e) {
            LogInfoService.Logger("Websocket Connection Service", "chats service -> getNewWsConn", false, true,
                "Error while getting go server api url", e);
            return result(false, "Error while getting connection string: " + e.getMessage());
        }
    }
    public Document push(Map<String, Object> data) {
        try {
            Document payload = new Document(data);
            String id = UUID.randomUUID().toString(); payload.put("messageId", id);
            kafka.send(str(data, "eventId"), str(data, "chatId"), json.writeValueAsString(payload));
            LogInfoService.Logger("Message Push Service", "chats service -> pushMsgToQueue", false, true,
                "Message successfully pushed to the queue", "none");
            return result(true, id);
        } catch (Exception e) {
            LogInfoService.Logger("Message Push Service", "chats service -> pushMsgToQueue", false, true,
                "Error while pushing message to the queue", e);
            return result(false, "Error while pushing message to the queue: " + e.getMessage());
        }
    }
    public Document messages(String eventId, String chatId) {
        try {
            var pipeline = List.of(doc("$match", doc("eventId", eventId)), doc("$project", doc("_id", 0, "messages", doc("$let", doc(
                "vars", doc("matchedChat", doc("$first", doc("$filter", doc("input", "$chats", "as", "chat", "cond", doc("$eq", List.of("$$chat.chatId", chatId)))))),
                "in", "$$matchedChat.messages")))));
            List<Document> data = store.aggregate("chat_messages", pipeline);
            if (!data.isEmpty() && data.get(0).get("messages") != null) {
                LogInfoService.Logger("Messages Fetch Service", "chats service -> fetchMsgs", true, false,
                    "Messages fetched successfully", "none");
                return result(true, data.get(0).get("messages"));
            }
            LogInfoService.Logger("Messages Fetch Service", "chats service -> fetchMsgs", true, false,
                "No messages found", "none");
            return result(true, "No messages found");
        } catch (Exception e) {
            LogInfoService.Logger("Messages Fetch Service", "chats service -> fetchMsgs", true, false,
                "Error while fetching messages", e);
            return result(false, error());
        }
    }
}
