package com.smartlivestock.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/analytics")
public class AnalyticsController {

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboardData() {
        Map<String, Object> data = new HashMap<>();
        data.put("status", "System running");
        data.put("totalAnimals", 100);
        data.put("alertsActive", 2);
        return ResponseEntity.ok(data);
    }
}
