package com.eventseasy.backend;

import com.auth0.jwt.interfaces.DecodedJWT;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.bson.Document;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/** Event-member media API. The content route uses a short-lived media token, not an access-token header. */
@RestController
@RequestMapping("/api/events/{eventId}/media")
public class MediaController {
    private final MediaService media;
    private final SessionService sessions;

    public MediaController(MediaService media, SessionService sessions) {
        this.media = media;
        this.sessions = sessions;
    }

    @GetMapping
    public Document list(@PathVariable String eventId, @RequestParam String type, HttpServletRequest request) {
        return media.list(eventId, user(request), type);
    }

    @PostMapping("/upload-intents")
    @org.springframework.web.bind.annotation.ResponseStatus(HttpStatus.CREATED)
    public Document uploadIntents(@PathVariable String eventId, @RequestBody Map<String, Object> body,
                                  HttpServletRequest request) {
        return media.createUploadIntents(eventId, user(request), body);
    }

    @PostMapping("/{mediaId}/complete")
    public Document complete(@PathVariable String eventId, @PathVariable String mediaId, HttpServletRequest request) {
        return media.completeUpload(eventId, mediaId, user(request));
    }

    @DeleteMapping
    public Document delete(@PathVariable String eventId, @RequestBody Map<String, Object> body,
                           HttpServletRequest request) {
        return media.delete(eventId, user(request), body);
    }

    @GetMapping("/{mediaId}/content")
    public void content(@PathVariable String eventId, @PathVariable String mediaId, @RequestParam String token,
                        @RequestHeader(value = "Range", required = false) String range, HttpServletResponse response) {
        media.stream(eventId, mediaId, token, range, response);
    }

    private String user(HttpServletRequest request) {
        DecodedJWT token = sessions.verify(request.getHeader("authorization"), false);
        String user = token.getClaim("user").asString();
        if (user == null || user.isBlank()) throw new ApiException(401, new Document("message", "Invalid access token"));
        return user;
    }
}
