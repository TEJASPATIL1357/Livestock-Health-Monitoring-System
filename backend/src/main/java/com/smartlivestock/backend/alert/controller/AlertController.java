package com.smartlivestock.backend.alert.controller;

import com.smartlivestock.backend.alert.dto.AlertResponse;
import com.smartlivestock.backend.alert.service.AlertService;
import com.smartlivestock.backend.common.exception.AuthException;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/alerts")
public class AlertController {

    private final AlertService alertService;

    public AlertController(AlertService alertService) {
        this.alertService = alertService;
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

    @GetMapping("/farm/{farmId}")
    public ResponseEntity<List<AlertResponse>> getAlertsByFarm(@PathVariable UUID farmId) {
        UUID authenticatedUserId = getAuthenticatedUserId();
        List<AlertResponse> response = alertService.getAlertsByFarm(farmId, authenticatedUserId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/farm/{farmId}/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(@PathVariable UUID farmId) {
        UUID authenticatedUserId = getAuthenticatedUserId();
        long count = alertService.getUnreadCount(farmId, authenticatedUserId);
        return ResponseEntity.ok(Map.of("unreadCount", count));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<AlertResponse> markAsRead(@PathVariable UUID id) {
        UUID authenticatedUserId = getAuthenticatedUserId();
        AlertResponse response = alertService.markAsRead(id, authenticatedUserId);
        return ResponseEntity.ok(response);
    }
}
