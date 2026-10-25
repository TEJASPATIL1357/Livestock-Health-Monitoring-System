package com.smartlivestock.backend.controller;

import com.smartlivestock.backend.dto.MilkProductionDto;
import com.smartlivestock.backend.service.MilkProductionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/milk")
public class MilkProductionController {

    private final MilkProductionService milkProductionService;

    public MilkProductionController(MilkProductionService milkProductionService) {
        this.milkProductionService = milkProductionService;
    }

    @PostMapping
    public ResponseEntity<MilkProductionDto> logMilkProduction(@RequestBody MilkProductionDto dto) {
        return ResponseEntity.ok(milkProductionService.logMilkProduction(dto));
    }

    @GetMapping("/animal/{animalId}")
    public ResponseEntity<List<MilkProductionDto>> getMilkStats(@PathVariable Long animalId) {
        return ResponseEntity.ok(milkProductionService.getMilkStats(animalId));
    }
}
