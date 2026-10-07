package com.eventseasy.backend;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import org.junit.jupiter.api.Test;
import org.springframework.mock.env.MockEnvironment;
import java.time.Instant;
import static org.junit.jupiter.api.Assertions.*;

class SessionServiceTest {
    MockEnvironment env = new MockEnvironment().withProperty("ACCESS_TOKEN_SECRET", "existing-access-secret")
        .withProperty("REFRESH_TOKEN_SECRET", "existing-refresh-secret").withProperty("ACCESS_ISSUER", "access")
        .withProperty("REFRESH_ISSUER", "refresh");
    SessionService service = new SessionService(env);
    @Test void tokenClaimsAndLifetimesAreUnchanged() {
        for (boolean refresh : new boolean[]{false, true}) {
            var decoded = service.verify(service.token("a@example.com", refresh), refresh);
            assertEquals("a@example.com", decoded.getClaim("user").asString());
            assertEquals(refresh ? "refresh" : "access", decoded.getIssuer());
            assertEquals(refresh ? 2592000 : 7200, decoded.getExpiresAtAsInstant().getEpochSecond() - decoded.getIssuedAtAsInstant().getEpochSecond());
        }
    }
    @Test void expiredAndWrongSecretTokensAreRejected() {
        String expired = JWT.create().withExpiresAt(Instant.now().minusSeconds(10)).sign(Algorithm.HMAC256("existing-access-secret"));
        assertThrows(Exception.class, () -> service.verify(expired, false));
        assertThrows(Exception.class, () -> service.verify(service.token("a@example.com", true), false));
        assertThrows(Exception.class, () -> service.verify("Bearer " + service.token("a@example.com", false), false));
    }
}
