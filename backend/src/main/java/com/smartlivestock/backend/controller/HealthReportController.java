package com.smartlivestock.backend.controller;

import com.smartlivestock.backend.service.HealthReportService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/reports")
public class HealthReportController {

    private final HealthReportService healthReportService;

    public HealthReportController(HealthReportService healthReportService) {
        this.healthReportService = healthReportService;
    }

    @GetMapping("/animal/{animalId}")
    public ResponseEntity<List<Object>> getReportsByAnimal(@PathVariable Long animalId) {
        return ResponseEntity.ok(healthReportService.getReportsByAnimal(animalId));
    }
}
