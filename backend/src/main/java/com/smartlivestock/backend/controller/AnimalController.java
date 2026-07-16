package com.smartlivestock.backend.controller;

import com.smartlivestock.backend.dto.AnimalDto;
import com.smartlivestock.backend.service.AnimalManagementService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/animals")
public class AnimalController {

    private final AnimalManagementService animalManagementService;

    public AnimalController(AnimalManagementService animalManagementService) {
        this.animalManagementService = animalManagementService;
    }

    @PostMapping
    public ResponseEntity<AnimalDto> createAnimal(@RequestBody AnimalDto animalDto) {
        return ResponseEntity.ok(animalManagementService.createAnimal(animalDto));
    }

    @GetMapping("/farmer/{farmerId}")
    public ResponseEntity<List<AnimalDto>> getAnimalsByFarmer(@PathVariable Long farmerId) {
        return ResponseEntity.ok(animalManagementService.getAnimalsByFarmer(farmerId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AnimalDto> getAnimalById(@PathVariable Long id) {
        return ResponseEntity.ok(animalManagementService.getAnimalById(id));
    }
}
