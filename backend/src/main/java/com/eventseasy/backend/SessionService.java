package com.eventseasy.backend;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.DecodedJWT;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;
import java.time.Instant;

@Service
public class SessionService {
    private final Environment env;
    public SessionService(Environment env) { this.env = env; }
    public String token(String user, boolean refresh) {
        String prefix = refresh ? "REFRESH" : "ACCESS";
        Instant now = Instant.now();
        var builder = JWT.create().withClaim("user", user).withIssuedAt(now)
            .withExpiresAt(now.plusSeconds(refresh ? 30L * 86400 : 7200));
        String issuer = env.getProperty(prefix + "_ISSUER");
        if (issuer != null) builder.withIssuer(issuer);
        return builder.sign(Algorithm.HMAC256(env.getRequiredProperty(prefix + "_TOKEN_SECRET")));
    }
    public DecodedJWT verify(String token, boolean refresh) {
        try {
            String secret = env.getRequiredProperty((refresh ? "REFRESH" : "ACCESS") + "_TOKEN_SECRET");
            String algorithm = JWT.decode(token).getAlgorithm();
            Algorithm hmac = switch (algorithm) {
                case "HS256" -> Algorithm.HMAC256(secret);
                case "HS384" -> Algorithm.HMAC384(secret);
                case "HS512" -> Algorithm.HMAC512(secret);
                default -> throw new IllegalArgumentException("Invalid token");
            };
            DecodedJWT decoded = JWT.require(hmac).ignoreIssuedAt().build().verify(token);
            LogInfoService.Logger("Token Verification Service", "session service -> verToken ", true, false,
                "Token verified", "none");
            return decoded;
        } catch (RuntimeException e) {
            LogInfoService.Logger("Token Verification Service", "session service -> verToken ", true, false,
                "Error verifying token", e);
            throw e;
        }
    }
}