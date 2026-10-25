package com.smartlivestock.backend.farm.service;

import com.smartlivestock.backend.common.exception.DuplicateResourceException;
import com.smartlivestock.backend.common.exception.ResourceNotFoundException;
import com.smartlivestock.backend.farm.dto.CreateFarmRequest;
import com.smartlivestock.backend.farm.dto.FarmResponse;
import com.smartlivestock.backend.farm.entity.Farm;
import com.smartlivestock.backend.farm.entity.FarmStatus;
import com.smartlivestock.backend.farm.repository.FarmRepository;
import com.smartlivestock.backend.membership.dto.FarmMembershipResponse;
import com.smartlivestock.backend.membership.entity.FarmMembership;
import com.smartlivestock.backend.membership.entity.MembershipRole;
import com.smartlivestock.backend.membership.entity.MembershipStatus;
import com.smartlivestock.backend.membership.repository.FarmMembershipRepository;
import com.smartlivestock.backend.user.entity.User;
import com.smartlivestock.backend.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class FarmService {

    private final FarmRepository farmRepository;
    private final UserRepository userRepository;
    private final FarmMembershipRepository membershipRepository;

    public FarmService(
            FarmRepository farmRepository,
            UserRepository userRepository,
            FarmMembershipRepository membershipRepository
    ) {
        this.farmRepository = farmRepository;
        this.userRepository = userRepository;
        this.membershipRepository = membershipRepository;
    }

    /**
     * Create farm and automatically assign creator as FARM_OWNER membership in a single transaction.
     */
    @Transactional
    public FarmResponse createFarm(CreateFarmRequest request, UUID authenticatedUserId) {
        UUID ownerId = request.getOwnerUserId() != null ? request.getOwnerUserId() : authenticatedUserId;

        if (authenticatedUserId != null && !ownerId.equals(authenticatedUserId)) {
            throw new com.smartlivestock.backend.common.exception.AuthException("FORBIDDEN", "Cannot create farm for another user", 403);
        }

        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Owner user not found with id: " + ownerId));

        Farm farm = new Farm();
        farm.setName(request.getName());
        farm.setDistrict(request.getDistrict());
        farm.setState(request.getState());
        farm.setCountry(request.getCountry());
        farm.setLivestockType(request.getLivestockType());
        farm.setStatus(FarmStatus.ACTIVE);

        Farm savedFarm = farmRepository.save(farm);

        // Ownership rule: Create FarmMembership with FARM_OWNER role transactionally
        FarmMembership membership = new FarmMembership();
        membership.setFarm(savedFarm);
        membership.setUser(owner);
        membership.setRole(MembershipRole.FARM_OWNER);
        membership.setStatus(MembershipStatus.ACTIVE);

        membershipRepository.save(membership);

        return FarmResponse.fromEntity(savedFarm);
    }

    @Transactional(readOnly = true)
    public FarmResponse getFarmById(UUID farmId, UUID authenticatedUserId) {
        if (authenticatedUserId == null) {
            throw new com.smartlivestock.backend.common.exception.AuthException("UNAUTHORIZED", "Authentication required", 401);
        }

        Farm farm = farmRepository.findById(farmId)
                .orElseThrow(() -> new ResourceNotFoundException("Farm not found with id: " + farmId));

        boolean isMember = membershipRepository.existsByFarmIdAndUserIdAndStatus(
                farmId, authenticatedUserId, MembershipStatus.ACTIVE
        );
        if (!isMember) {
            throw new com.smartlivestock.backend.common.exception.AuthException("FORBIDDEN", "Access to farm denied", 403);
        }

        return FarmResponse.fromEntity(farm);
    }

    @Transactional(readOnly = true)
    public List<FarmMembershipResponse> getUserFarms(UUID userId, UUID authenticatedUserId) {
        if (authenticatedUserId == null) {
            throw new com.smartlivestock.backend.common.exception.AuthException("UNAUTHORIZED", "Authentication required", 401);
        }

        if (!userId.equals(authenticatedUserId)) {
            throw new com.smartlivestock.backend.common.exception.AuthException("FORBIDDEN", "Access to user farms denied", 403);
        }

        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found with id: " + userId);
        }
        return membershipRepository.findByUserId(userId).stream()
                .map(FarmMembershipResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public FarmResponse createFarm(CreateFarmRequest request) {
        return createFarm(request, request.getOwnerUserId());
    }

    @Transactional(readOnly = true)
    public FarmResponse getFarmById(UUID farmId) {
        throw new UnsupportedOperationException("getFarmById requires authenticatedUserId");
    }

    @Transactional(readOnly = true)
    public List<FarmMembershipResponse> getUserFarms(UUID userId) {
        return getUserFarms(userId, userId);
    }
}
