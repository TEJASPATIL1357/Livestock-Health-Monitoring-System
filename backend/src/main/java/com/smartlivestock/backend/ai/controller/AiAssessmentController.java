package com.smartlivestock.backend.ai.controller;

import com.smartlivestock.backend.ai.dto.AiAssessmentResponse;
import com.smartlivestock.backend.ai.service.AiHealthIntelligenceService;
import com.smartlivestock.backend.common.exception.AuthException;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/ai")
public class AiAssessmentController {

    private final AiHealthIntelligenceService aiHealthIntelligenceService;

    public AiAssessmentController(AiHealthIntelligenceService aiHealthIntelligenceService) {
        this.aiHealthIntelligenceService = aiHealthIntelligenceService;
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

    @GetMapping("/assessment/animal/{animalId}")
    public ResponseEntity<AiAssessmentResponse> getLatestAssessment(@PathVariable UUID animalId) {
        UUID authenticatedUserId = getAuthenticatedUserId();
        AiAssessmentResponse response = aiHealthIntelligenceService.getLatestAssessment(animalId, authenticatedUserId);
        return ResponseEntity.ok(response);
    }
}
