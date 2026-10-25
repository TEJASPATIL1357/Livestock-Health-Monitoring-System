package com.smartlivestock.backend.notification.repository;

import com.smartlivestock.backend.notification.entity.PushToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PushTokenRepository extends JpaRepository<PushToken, UUID> {
    Optional<PushToken> findByToken(String token);
    List<PushToken> findByUserId(UUID userId);
}
