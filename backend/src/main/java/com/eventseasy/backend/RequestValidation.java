package com.eventseasy.backend;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;
import java.util.*;
import static com.eventseasy.backend.Values.*;

/** Mirrors the original class-validator DTOs without Java's implicit string coercion. */
@Component
public class RequestValidation {
    private final Map<String, Map<String, List<String>>> schemas;
    public RequestValidation(ObjectMapper json) throws Exception {
        try (var input = getClass().getResourceAsStream("/validation.json")) {
            schemas = json.readValue(input, new TypeReference<>() {});
        }
    }
    public void check(String schema, Map<String, ?> value) {
        List<String> messages = new ArrayList<>();
        schemas.get(schema).forEach((field, validators) -> {
            Object item = value.get(field);
            if (item == null && validators.contains("IsOptional")) return;
            for (String validator : validators) {
                String error = switch (validator) {
                    case "IsNotEmpty" -> item == null || "".equals(item) ? "should not be empty" : null;
                    case "IsString" -> item instanceof String ? null : "must be a string";
                    case "IsBoolean" -> item instanceof Boolean ? null : "must be a boolean value";
                    case "IsArray" -> item instanceof List ? null : "must be an array";
                    case "IsEmail" -> email(item) ? null : "must be an email";
                    case "IsDateString" -> isoDate(item) ? null : "must be a valid ISO 8601 date string";
                    default -> null;
                };
                if (error != null && !messages.contains(field + " " + error)) messages.add(field + " " + error);
            }
        });
        if (!messages.isEmpty()) throw new ApiException(400, doc("message", messages, "error", "Bad Request", "statusCode", 400));
    }
    private boolean email(Object value) {
        return value instanceof String text && LegacyValidators.email(text);
    }
    private boolean isoDate(Object value) {
        return value instanceof String text && LegacyValidators.iso8601(text);
    }
}
