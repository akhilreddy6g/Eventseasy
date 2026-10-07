package com.eventseasy.backend;

import org.springframework.core.env.Environment;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import static com.eventseasy.backend.Values.*;

@RestController
public class AwakeController {
    private final Environment env;
    public AwakeController(Environment env) { this.env = env; }
    @PostMapping({"/api/awake", "/api/awake/"}) @ResponseStatus(HttpStatus.CREATED)
    public Object awake(@RequestHeader(value = "api-key", required = false) String apiKey) {
        String required = env.getProperty("CRON_JOB_API_KEY");
        if (required == null || required.isEmpty() || !required.equals(apiKey))
            throw new ApiException(403, doc("message", "Unauthorized", "error", "Forbidden", "statusCode", 403));
        LogInfoService.Logger("Awake Request", "awake server service -> awakeServer", false, false,
            "awake", "none");
        return doc("message", "Server activated successfully");
    }
}
