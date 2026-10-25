package com.smartlivestock.backend.animal.controller;

import com.smartlivestock.backend.animal.dto.AnimalResponse;
import com.smartlivestock.backend.animal.dto.CreateAnimalRequest;
import com.smartlivestock.backend.animal.service.AnimalService;
import com.smartlivestock.backend.common.exception.AuthException;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/animals")
public class AnimalController {

    private final AnimalService animalService;

    public AnimalController(AnimalService animalService) {
        this.animalService = animalService;
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
    public ResponseEntity<List<AnimalResponse>> getAnimalsByFarm(@PathVariable UUID farmId) {
        UUID authenticatedUserId = getAuthenticatedUserId();
        List<AnimalResponse> response = animalService.getAnimalsByFarm(farmId, authenticatedUserId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AnimalResponse> getAnimalById(@PathVariable UUID id) {
        UUID authenticatedUserId = getAuthenticatedUserId();
        AnimalResponse response = animalService.getAnimalById(id, authenticatedUserId);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<AnimalResponse> createAnimal(@Valid @RequestBody CreateAnimalRequest request) {
        UUID authenticatedUserId = getAuthenticatedUserId();
        AnimalResponse response = animalService.createAnimal(request, authenticatedUserId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
