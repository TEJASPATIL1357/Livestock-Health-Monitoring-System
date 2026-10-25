package com.smartlivestock.backend.membership.dto;

import com.smartlivestock.backend.membership.entity.FarmMembership;
import com.smartlivestock.backend.membership.entity.MembershipRole;
import com.smartlivestock.backend.membership.entity.MembershipStatus;

import java.time.OffsetDateTime;
import java.util.UUID;

public class FarmMembershipResponse {

    private UUID id;
    private UUID farmId;
    private String farmName;
    private UUID userId;
    private String userName;
    private MembershipRole role;
    private MembershipStatus status;
    private com.smartlivestock.backend.farm.dto.FarmResponse farm;
    private OffsetDateTime createdAt;

    public FarmMembershipResponse() {}

    public static FarmMembershipResponse fromEntity(FarmMembership membership) {
        FarmMembershipResponse response = new FarmMembershipResponse();
        response.setId(membership.getId());
        response.setFarmId(membership.getFarm().getId());
        response.setFarmName(membership.getFarm().getName());
        response.setUserId(membership.getUser().getId());
        response.setUserName(membership.getUser().getName());
        response.setRole(membership.getRole());
        response.setStatus(membership.getStatus());
        if (membership.getFarm() != null) {
            response.setFarm(com.smartlivestock.backend.farm.dto.FarmResponse.fromEntity(membership.getFarm()));
        }
        response.setCreatedAt(membership.getCreatedAt());
        return response;
    }

    public com.smartlivestock.backend.farm.dto.FarmResponse getFarm() { return farm; }
    public void setFarm(com.smartlivestock.backend.farm.dto.FarmResponse farm) { this.farm = farm; }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getFarmId() { return farmId; }
    public void setFarmId(UUID farmId) { this.farmId = farmId; }

    public String getFarmName() { return farmName; }
    public void setFarmName(String farmName) { this.farmName = farmName; }

    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public MembershipRole getRole() { return role; }
    public void setRole(MembershipRole role) { this.role = role; }

    public MembershipStatus getStatus() { return status; }
    public void setStatus(MembershipStatus status) { this.status = status; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
}
