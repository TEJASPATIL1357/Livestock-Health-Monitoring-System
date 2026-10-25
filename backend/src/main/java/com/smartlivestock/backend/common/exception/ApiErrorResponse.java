package com.smartlivestock.backend.common.exception;

import java.time.OffsetDateTime;
import java.util.UUID;

public class ApiErrorResponse {
    private String code;
    private String message;
    private String timestamp;
    private String requestId;

    public ApiErrorResponse() {}

    public ApiErrorResponse(String code, String message) {
        this.code = code;
        this.message = message;
        this.timestamp = OffsetDateTime.now().toString();
        this.requestId = UUID.randomUUID().toString();
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }

    public String getRequestId() {
        return requestId;
    }

    public void setRequestId(String requestId) {
        this.requestId = requestId;
    }
}
