package com.smartlivestock.backend.membership.repository;

import com.smartlivestock.backend.membership.entity.FarmMembership;
import com.smartlivestock.backend.membership.entity.MembershipStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FarmMembershipRepository extends JpaRepository<FarmMembership, UUID> {
    List<FarmMembership> findByUserId(UUID userId);
    List<FarmMembership> findByFarmId(UUID farmId);
    Optional<FarmMembership> findByFarmIdAndUserId(UUID farmId, UUID userId);
    boolean existsByFarmIdAndUserIdAndStatus(UUID farmId, UUID userId, MembershipStatus status);

    @org.springframework.data.jpa.repository.Query("SELECT m.user.id FROM FarmMembership m WHERE m.farm.id = :farmId AND m.status = :status")
    List<UUID> findUserIdsByFarmIdAndStatus(
            @org.springframework.data.repository.query.Param("farmId") UUID farmId,
            @org.springframework.data.repository.query.Param("status") MembershipStatus status
    );

    default List<UUID> findUserIdsByFarmId(UUID farmId) {
        return findUserIdsByFarmIdAndStatus(farmId, MembershipStatus.ACTIVE);
    }
}
