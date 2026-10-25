package com.smartlivestock.backend.farm.dto;

import com.smartlivestock.backend.farm.entity.LivestockType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public class CreateFarmRequest {

    private UUID ownerUserId;

    @NotBlank(message = "Farm name is required")
    @Size(max = 100, message = "Farm name must not exceed 100 characters")
    private String name;

    @Size(max = 100, message = "District must not exceed 100 characters")
    private String district;

    @Size(max = 100, message = "State must not exceed 100 characters")
    private String state;

    @Size(max = 100, message = "Country must not exceed 100 characters")
    private String country;

    @NotNull(message = "Livestock type is required")
    private LivestockType livestockType = LivestockType.DAIRY;

    public CreateFarmRequest() {}

    public UUID getOwnerUserId() { return ownerUserId; }
    public void setOwnerUserId(UUID ownerUserId) { this.ownerUserId = ownerUserId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }

    public LivestockType getLivestockType() { return livestockType; }
    public void setLivestockType(LivestockType livestockType) { this.livestockType = livestockType; }
}
