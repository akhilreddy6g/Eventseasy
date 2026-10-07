package com.eventseasy.backend;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.*;
import static com.eventseasy.backend.Values.*;

@RestController
@RequestMapping("/api/chats")
public class ChatController {
    private final ChatService chats;
    private final CookieService cookies;
    private final RequestValidation validation;
    public ChatController(ChatService chats, CookieService cookies, RequestValidation validation) { this.chats = chats; this.cookies = cookies; this.validation = validation; }
    private String user(HttpServletRequest request) throws Exception {
        if (!cookies.has(request, "refreshToken")) throw new ApiException(401, doc("message", "Missing auth cookie", "error", "Unauthorized", "statusCode", 401));
        return cookies.user(request);
    }
    @PostMapping({"/create", "/create/"}) @ResponseStatus(HttpStatus.CREATED)
    public Object create(@RequestBody Map<String, Object> data, HttpServletRequest request) throws Exception {
        validation.check("ChatBodyData", data);
        String user = user(request);
        List<Object> restricted = new ArrayList<>();
        for (Object value : (List<?>) data.get("restrictedUsers")) {
            if (value == null) throw new IllegalArgumentException();
            restricted.add(value instanceof Map<?, ?> map ? map.get("user") : null);
        }
        var body = new HashMap<>(data); body.put("restrictedUsers", restricted);
        return chats.create(body, user);
    }
    @GetMapping({"/data", "/data/"})
    public Object data(@RequestParam Map<String, Object> query, HttpServletRequest request) throws Exception {
        validation.check("EventIdQueryParams", query); return chats.chats(str(query, "eventId"), user(request));
    }
    @PostMapping({"/start", "/start/"}) @ResponseStatus(HttpStatus.CREATED)
    public Object start(@RequestParam Map<String, Object> query) {
        validation.check("EventIdChatIdQueryParams", query); return chats.start(str(query, "eventId"), str(query, "chatId"));
    }
    @PostMapping({"/new-ws-conn", "/new-ws-conn/"}) @ResponseStatus(HttpStatus.CREATED)
    public Object connection(@RequestParam Map<String, Object> query) {
        validation.check("EventIdChatIdQueryParams", query); return chats.connection(str(query, "eventId"), str(query, "chatId"));
    }
    @GetMapping({"/active-subs", "/active-subs/"}) public Object subscribers() { return chats.subscribers(); }
    @PostMapping({"/push-msg", "/push-msg/"}) @ResponseStatus(HttpStatus.CREATED)
    public Object push(@RequestBody Map<String, Object> data) { validation.check("MessageBody", data); return chats.push(data); }
    @GetMapping({"/fetch-msgs", "/fetch-msgs/"})
    public Object messages(@RequestParam Map<String, Object> query) {
        validation.check("EventIdChatIdQueryParams", query); return chats.messages(str(query, "eventId"), str(query, "chatId"));
    }
}
