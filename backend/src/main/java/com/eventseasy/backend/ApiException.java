package com.eventseasy.backend;

public class ApiException extends RuntimeException {
    final int status;
    final Object body;
    ApiException(int status, Object body) { this.status = status; this.body = body; }
}
