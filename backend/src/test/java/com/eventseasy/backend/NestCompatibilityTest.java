package com.eventseasy.backend;

import com.fasterxml.jackson.databind.*;
import org.junit.jupiter.api.*;
import org.springframework.security.crypto.argon2.Argon2PasswordEncoder;
import java.util.*;
import java.util.stream.*;
import static org.junit.jupiter.api.Assertions.*;

class NestCompatibilityTest {
    ObjectMapper json = new ObjectMapper();
    @TestFactory Stream<DynamicTest> originalDtoFixtures() throws Exception {
        RequestValidation validation = new RequestValidation(json);
        JsonNode fixtures = json.readTree(getClass().getResourceAsStream("/nest-validation.json"));
        return StreamSupport.stream(fixtures.spliterator(), false).map(f -> DynamicTest.dynamicTest(f.get("schema").asText() + " " + f.get("input"), () -> {
            @SuppressWarnings("unchecked") Map<String, Object> input = json.convertValue(f.get("input"), Map.class);
            if (f.get("status").asInt() == 200) validation.check(f.get("schema").asText(), input);
            else {
                ApiException error = assertThrows(ApiException.class, () -> validation.check(f.get("schema").asText(), input));
                assertEquals(f.get("status").asInt(), error.status);
                assertEquals(f.get("body"), json.valueToTree(error.body));
            }
        }));
    }
    @TestFactory Stream<DynamicTest> originalSha256PartitionFixtures() throws Exception {
        JsonNode fixtures = json.readTree(getClass().getResourceAsStream("/nest-partitions.json"));
        return StreamSupport.stream(fixtures.spliterator(), false).map(f -> DynamicTest.dynamicTest(f.toString(), () ->
            assertEquals(f.get("expected").asInt(), KafkaGateway.computePartition(f.get("event").asText(), f.get("chat").asText(), f.get("count").asInt()))));
    }
    @TestFactory Stream<DynamicTest> validatorEdgeFixtures() throws Exception {
        JsonNode fixtures = json.readTree(getClass().getResourceAsStream("/nest-validator-edges.json"));
        return StreamSupport.stream(fixtures.spliterator(), false).map(f -> DynamicTest.dynamicTest(f.toString(), () -> {
            boolean actual = f.get("kind").asText().equals("email") ? LegacyValidators.email(f.get("input").asText()) : LegacyValidators.iso8601(f.get("input").asText());
            assertEquals(f.get("expected").asBoolean(), actual);
        }));
    }
    @Test void verifiesHashGeneratedByOriginalNodeArgon2() throws Exception {
        String hash;
        try (var input = getClass().getResourceAsStream("/nest-argon2.txt")) { hash = new String(input.readAllBytes(), java.nio.charset.StandardCharsets.UTF_8).trim(); }
        var encoder = new Argon2PasswordEncoder(16, 32, 4, 65536, 3);
        assertTrue(encoder.matches("migration-test-password", hash));
        assertFalse(encoder.matches("wrong password", hash));
    }
}
