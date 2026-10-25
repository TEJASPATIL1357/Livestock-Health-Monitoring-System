package com.smartlivestock.backend.animal.dto;

import com.smartlivestock.backend.animal.entity.Animal;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public class AnimalResponse {
    private UUID id;
    private UUID farmId;
    private String name;
    private String tagNumber;
    private String species;
    private String breed;
    private LocalDate dateOfBirth;
    private String gender;
    private String status;
    private Instant createdAt;
    private Instant updatedAt;

    public static AnimalResponse fromEntity(Animal animal) {
        AnimalResponse dto = new AnimalResponse();
        dto.setId(animal.getId());
        dto.setFarmId(animal.getFarm().getId());
        dto.setName(animal.getName());
        dto.setTagNumber(animal.getTagNumber());
        dto.setSpecies(animal.getSpecies());
        dto.setBreed(animal.getBreed());
        dto.setDateOfBirth(animal.getDateOfBirth());
        dto.setGender(animal.getGender());
        dto.setStatus(animal.getStatus());
        dto.setCreatedAt(animal.getCreatedAt());
        dto.setUpdatedAt(animal.getUpdatedAt());
        return dto;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getFarmId() { return farmId; }
    public void setFarmId(UUID farmId) { this.farmId = farmId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getTagNumber() { return tagNumber; }
    public void setTagNumber(String tagNumber) { this.tagNumber = tagNumber; }

    public String getSpecies() { return species; }
    public void setSpecies(String species) { this.species = species; }

    public String getBreed() { return breed; }
    public void setBreed(String breed) { this.breed = breed; }

    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
