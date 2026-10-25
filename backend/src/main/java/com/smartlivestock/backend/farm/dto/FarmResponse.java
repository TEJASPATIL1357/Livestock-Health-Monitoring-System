package com.smartlivestock.backend.farm.dto;

import com.smartlivestock.backend.farm.entity.Farm;
import com.smartlivestock.backend.farm.entity.FarmStatus;
import com.smartlivestock.backend.farm.entity.LivestockType;

import java.time.OffsetDateTime;
import java.util.UUID;

public class FarmResponse {

    private UUID id;
    private String name;
    private String district;
    private String state;
    private String country;
    private LivestockType livestockType;
    private FarmStatus status;
    private OffsetDateTime createdAt;

    public FarmResponse() {}

    public static FarmResponse fromEntity(Farm farm) {
        FarmResponse response = new FarmResponse();
        response.setId(farm.getId());
        response.setName(farm.getName());
        response.setDistrict(farm.getDistrict());
        response.setState(farm.getState());
        response.setCountry(farm.getCountry());
        response.setLivestockType(farm.getLivestockType());
        response.setStatus(farm.getStatus());
        response.setCreatedAt(farm.getCreatedAt());
        return response;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

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

    public FarmStatus getStatus() { return status; }
    public void setStatus(FarmStatus status) { this.status = status; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
}
