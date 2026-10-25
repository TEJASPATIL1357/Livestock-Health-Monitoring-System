package com.smartlivestock.backend.notification.controller;

import com.smartlivestock.backend.common.exception.AuthException;
import com.smartlivestock.backend.notification.dto.RegisterPushTokenRequest;
import com.smartlivestock.backend.notification.service.PushNotificationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {

    private final PushNotificationService pushNotificationService;

    public NotificationController(PushNotificationService pushNotificationService) {
        this.pushNotificationService = pushNotificationService;
    }

    private UUID getAuthenticatedUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal() == null) {
            throw new AuthException("UNAUTHORIZED", "Authentication required", 401);
        }
        Object principal = auth.getPrincipal();
        try {
            if (principal instanceof UUID) {
                return (UUID) principal;
            }
            return UUID.fromString(principal.toString());
        } catch (IllegalArgumentException e) {
            throw new AuthException("UNAUTHORIZED", "Invalid user identity", 401);
        }
    }

    @PostMapping("/push-token")
    public ResponseEntity<Map<String, String>> registerPushToken(@Valid @RequestBody RegisterPushTokenRequest request) {
        UUID authenticatedUserId = getAuthenticatedUserId();
        pushNotificationService.registerToken(request, authenticatedUserId);
        return ResponseEntity.ok(Map.of("message", "Push token registered successfully"));
    }
}
