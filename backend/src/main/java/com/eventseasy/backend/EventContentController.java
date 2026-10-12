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
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/events/{eventId}")
public class EventContentController {
    private final EventContentService content;
    private final SessionService sessions;

    public EventContentController(EventContentService content, SessionService sessions) {
        this.content = content;
        this.sessions = sessions;
    }

    @GetMapping("/access")
    public Document access(@PathVariable String eventId, HttpServletRequest request) {
        return content.access(eventId, user(request));
    }

    @GetMapping("/overview")
    public Document overview(@PathVariable String eventId, HttpServletRequest request) {
        return content.overview(eventId, user(request));
    }

    @PutMapping("/overview")
    public Document saveOverview(@PathVariable String eventId, @RequestBody Map<String, Object> body, HttpServletRequest request) {
        return content.saveOverview(eventId, user(request), body);
    }

    @GetMapping("/destination")
    public Document destination(@PathVariable String eventId, HttpServletRequest request) {
        return content.destination(eventId, user(request));
    }

    @PutMapping("/destination")
    public Document saveDestination(@PathVariable String eventId, @RequestBody Map<String, Object> body, HttpServletRequest request) {
        return content.saveDestination(eventId, user(request), body);
    }

    @GetMapping("/landmarks")
    public Document landmarks(@PathVariable String eventId, HttpServletRequest request) {
        return content.landmarks(eventId, user(request));
    }

    @PostMapping("/landmarks")
    @org.springframework.web.bind.annotation.ResponseStatus(HttpStatus.CREATED)
    public Document createLandmark(@PathVariable String eventId, @RequestBody Map<String, Object> body, HttpServletRequest request) {
        return content.createLandmark(eventId, user(request), body);
    }

    @PutMapping("/landmarks/{landmarkId}")
    public Document updateLandmark(@PathVariable String eventId, @PathVariable String landmarkId,
                                   @RequestBody Map<String, Object> body, HttpServletRequest request) {
        return content.updateLandmark(eventId, landmarkId, user(request), body);
    }

    @DeleteMapping("/landmarks")
    public Document deleteLandmarks(@PathVariable String eventId, @RequestBody Map<String, Object> body, HttpServletRequest request) {
        return content.deleteLandmarks(eventId, user(request), body);
    }

    @PostMapping("/assets/upload-intents")
    @org.springframework.web.bind.annotation.ResponseStatus(HttpStatus.CREATED)
    public Document uploadIntent(@PathVariable String eventId, @RequestBody Map<String, Object> body, HttpServletRequest request) {
        return content.createAssetIntent(eventId, user(request), body);
    }

    @PostMapping("/assets/{assetId}/complete")
    public Document completeAsset(@PathVariable String eventId, @PathVariable String assetId,
                                  @RequestBody Map<String, Object> body, HttpServletRequest request) {
        return content.completeAsset(eventId, assetId, user(request), body);
    }

    @GetMapping("/content/{kind}/{assetId}")
    public void assetContent(@PathVariable String eventId, @PathVariable String kind, @PathVariable String assetId,
                             @org.springframework.web.bind.annotation.RequestParam String token, HttpServletResponse response) {
        content.streamAsset(eventId, kind, assetId, token, response);
    }

    private String user(HttpServletRequest request) {
        DecodedJWT token = sessions.verify(request.getHeader("authorization"), false);
        String user = token.getClaim("user").asString();
        if (user == null || user.isBlank()) throw new ApiException(401, new Document("message", "Invalid access token"));
        return user;
    }
}
