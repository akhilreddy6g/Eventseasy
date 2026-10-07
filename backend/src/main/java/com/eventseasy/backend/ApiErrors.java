package com.eventseasy.backend;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import static com.eventseasy.backend.Values.*;

@RestControllerAdvice
public class ApiErrors {
    @ExceptionHandler(ApiException.class)
    ResponseEntity<Object> api(ApiException error) { return ResponseEntity.status(error.status).body(error.body); }
    @ExceptionHandler(HttpMessageNotReadableException.class)
    ResponseEntity<Object> malformed(HttpMessageNotReadableException error) {
        return ResponseEntity.badRequest().body(doc("message", "Unexpected token in JSON", "error", "Bad Request", "statusCode", 400));
    }
    @ExceptionHandler(Exception.class)
    ResponseEntity<Object> unexpected(Exception error) {
        return ResponseEntity.internalServerError().body(doc("statusCode", 500, "message", "Internal server error"));
    }
}
