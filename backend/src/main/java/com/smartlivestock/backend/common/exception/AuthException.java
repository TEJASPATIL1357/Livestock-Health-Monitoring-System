package com.smartlivestock.backend.common.exception;

public class AuthException extends RuntimeException {
    private final String errorCode;
    private final int statusCode;

    public AuthException(String errorCode, String message, int statusCode) {
        super(message);
        this.errorCode = errorCode;
        this.statusCode = statusCode;
    }

    public AuthException(String errorCode, String message) {
        this(errorCode, message, 401);
    }

    public String getErrorCode() {
        return errorCode;
    }

    public int getStatusCode() {
        return statusCode;
    }
}
