package com.smartlivestock.backend.controller;

import com.smartlivestock.backend.dto.ChatRequestDto;
import com.smartlivestock.backend.service.HealthIntelligenceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/chat")
public class ChatController {

    private final HealthIntelligenceService healthIntelligenceService;

    public ChatController(HealthIntelligenceService healthIntelligenceService) {
        this.healthIntelligenceService = healthIntelligenceService;
    }

    @PostMapping("/message")
    public ResponseEntity<String> processMessage(@RequestBody ChatRequestDto requestDto) {
        return ResponseEntity.ok(healthIntelligenceService.processChat(requestDto));
    }
}
