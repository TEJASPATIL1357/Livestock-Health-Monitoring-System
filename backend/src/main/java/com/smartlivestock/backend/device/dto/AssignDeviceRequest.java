package com.smartlivestock.backend.device.dto;

import java.util.UUID;

public class AssignDeviceRequest {

    private UUID animalId; // Nullable to unassign

    public UUID getAnimalId() { return animalId; }
    public void setAnimalId(UUID animalId) { this.animalId = animalId; }
}
