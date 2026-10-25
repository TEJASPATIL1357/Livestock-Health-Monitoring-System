package com.smartlivestock.backend.common.exception;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.junit.jupiter.api.Assertions.*;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    @DisplayName("Should return HTTP 500 with generic error response when handling unhandled exceptions")
    void shouldHandleGeneralException() {
        RuntimeException ex = new RuntimeException("Unexpected internal DB failure");

        ResponseEntity<ApiErrorResponse> response = handler.handleGeneralException(ex);

        assertNotNull(response);
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("INTERNAL_SERVER_ERROR", response.getBody().getCode());
        assertEquals("An unexpected error occurred.", response.getBody().getMessage());
    }
}
