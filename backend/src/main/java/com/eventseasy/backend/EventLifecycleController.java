package com.eventseasy.backend;

import com.auth0.jwt.interfaces.DecodedJWT;
import jakarta.servlet.http.HttpServletRequest;
import org.bson.Document;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/events/{eventId}")
public class EventLifecycleController {
    private final EventLifecycleService lifecycle;
    private final SessionService sessions;

    public EventLifecycleController(EventLifecycleService lifecycle, SessionService sessions) {
        this.lifecycle = lifecycle;
        this.sessions = sessions;
    }

    @DeleteMapping
    public Document deactivateEvent(@PathVariable String eventId, HttpServletRequest request) {
        return lifecycle.deactivateEvent(eventId, user(request));
    }

    @DeleteMapping("/membership")
    public Document leaveEvent(@PathVariable String eventId, HttpServletRequest request) {
        return lifecycle.leaveEvent(eventId, user(request));
    }

    private String user(HttpServletRequest request) {
        DecodedJWT token = sessions.verify(request.getHeader("authorization"), false);
        String user = token.getClaim("user").asString();
        if (user == null || user.isBlank()) throw new ApiException(401, new Document("message", "Invalid access token"));
        return user;
    }
}
