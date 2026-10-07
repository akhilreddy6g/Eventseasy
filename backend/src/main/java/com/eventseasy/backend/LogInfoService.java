package com.eventseasy.backend;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Java equivalent of the NestJS LogInfoService.  Keep the field names and
 * field order aligned with backend/src/auth/logger/logger.service.ts.
 */
final class LogInfoService {
    private static final Logger LOG = LoggerFactory.getLogger(LogInfoService.class);

    private LogInfoService() {}

    static void Logger(String request, String source, boolean queryParams, boolean bodyParams,
                       Object response, Object error) {
        Map<String, Object> logEntry = new LinkedHashMap<>();
        logEntry.put("request", request);
        logEntry.put("source", source);
        logEntry.put("timestamp", Instant.now());
        logEntry.put("queryParams", queryParams);
        logEntry.put("bodyParams", bodyParams);
        logEntry.put("response", response);
        logEntry.put("error", error);
        LOG.info("{}", logEntry);
    }

    static void consoleLog(Object value) {
        LOG.info("{}", value);
    }

    static void consoleLog(String prefix, Object value) {
        LOG.info("{}{}", prefix, value);
    }
}
