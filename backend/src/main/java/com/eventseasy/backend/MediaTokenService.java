package com.eventseasy.backend;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.DecodedJWT;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;

import java.time.Instant;

/** Tokens used only by image/video elements to access the backend delivery proxy. */
@Service
public class MediaTokenService {
    private final Environment env;

    public MediaTokenService(Environment env) {
        this.env = env;
    }

    public String issue(String eventId, String mediaId) {
        return issueResource(eventId, "media:" + mediaId);
    }

    /** Issues a token for a non-gallery resource while keeping legacy media tokens scoped. */
    public String issueResource(String eventId, String resourceId) {
        Instant now = Instant.now();
        return JWT.create()
            .withClaim("eventId", eventId)
            .withClaim("mediaId", resourceId)
            .withIssuedAt(now)
            .withExpiresAt(now.plusSeconds(ttlSeconds()))
            .sign(algorithm());
    }

    public void verify(String token, String eventId, String mediaId) {
        verifyResource(token, eventId, "media:" + mediaId);
    }

    public void verifyResource(String token, String eventId, String resourceId) {
        DecodedJWT decoded = JWT.require(algorithm()).build().verify(token);
        if (!eventId.equals(decoded.getClaim("eventId").asString()) || !resourceId.equals(decoded.getClaim("mediaId").asString())) {
            throw new IllegalArgumentException("Invalid media token");
        }
    }

    private Algorithm algorithm() {
        String secret = env.getProperty("MEDIA_DELIVERY_TOKEN_SECRET");
        if (secret == null || secret.isBlank() || secret.startsWith("replace-with-")) {
            secret = env.getRequiredProperty("ACCESS_TOKEN_SECRET");
        }
        return Algorithm.HMAC256(secret);
    }

    private long ttlSeconds() {
        try {
            long configured = Long.parseLong(env.getProperty("media.delivery-token-ttl-seconds", "300"));
            return Math.max(60, Math.min(configured, 3600));
        } catch (NumberFormatException ignored) {
            return 300;
        }
    }
}
