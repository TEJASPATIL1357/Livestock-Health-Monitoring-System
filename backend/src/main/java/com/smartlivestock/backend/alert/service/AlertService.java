package com.smartlivestock.backend.alert.service;

import com.smartlivestock.backend.alert.dto.AlertResponse;
import com.smartlivestock.backend.alert.entity.Alert;
import com.smartlivestock.backend.alert.repository.AlertRepository;
import com.smartlivestock.backend.animal.entity.Animal;
import com.smartlivestock.backend.common.exception.AuthException;
import com.smartlivestock.backend.common.exception.ResourceNotFoundException;
import com.smartlivestock.backend.device.entity.Device;
import com.smartlivestock.backend.farm.entity.Farm;
import com.smartlivestock.backend.membership.entity.MembershipStatus;
import com.smartlivestock.backend.membership.repository.FarmMembershipRepository;
import com.smartlivestock.backend.notification.service.ExpoPushNotificationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AlertService {

    private final AlertRepository alertRepository;
    private final FarmMembershipRepository membershipRepository;

    private final ExpoPushNotificationService pushNotificationService;

    public AlertService(
            AlertRepository alertRepository,
            FarmMembershipRepository membershipRepository,
            ExpoPushNotificationService pushNotificationService
    ) {
        this.alertRepository = alertRepository;
        this.membershipRepository = membershipRepository;
        this.pushNotificationService = pushNotificationService;
    }

    private void verifyFarmMembership(UUID farmId, UUID userId) {
        boolean isMember = membershipRepository.existsByFarmIdAndUserIdAndStatus(
                farmId, userId, MembershipStatus.ACTIVE
        );
        if (!isMember) {
            throw new AuthException("FORBIDDEN", "Access to farm alerts denied", 403);
        }
    }

    @Transactional
    public void createAlert(
            Farm farm,
            Animal animal,
            Device device,
            String alertType,
            String severity,
            String title,
            String message,
            String dedupKey
    ) {
        // Cooldown check: 1 hour deduplication window
        if (dedupKey != null && !dedupKey.isBlank()) {
            Instant threshold = Instant.now().minus(Duration.ofHours(1));
            boolean existsRecent = alertRepository.existsByDedupKeyAndCreatedAtAfter(dedupKey, threshold);
            if (existsRecent) {
                return; // Deduplicated, skip saving
            }
        }

        Alert alert = new Alert();
        alert.setFarm(farm);
        alert.setAnimal(animal);
        alert.setDevice(device);
        alert.setAlertType(alertType);
        alert.setSeverity(severity);
        alert.setTitle(title);
        alert.setMessage(message);
        alert.setDedupKey(dedupKey);
        alert.setIsRead(false);

        Alert saved = alertRepository.save(alert);

        // Dispatch async push notification to active farm members
        pushNotificationService.sendPushNotificationForAlert(saved);
    }

    @Transactional(readOnly = true)
    public List<AlertResponse> getAlertsByFarm(UUID farmId, UUID authenticatedUserId) {
        verifyFarmMembership(farmId, authenticatedUserId);
        return alertRepository.findByFarmIdOrderByCreatedAtDesc(farmId).stream()
                .map(AlertResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(UUID farmId, UUID authenticatedUserId) {
        verifyFarmMembership(farmId, authenticatedUserId);
        return alertRepository.countByFarmIdAndIsReadFalse(farmId);
    }

    @Transactional
    public AlertResponse markAsRead(UUID alertId, UUID authenticatedUserId) {
        Alert alert = alertRepository.findById(alertId)
                .orElseThrow(() -> new ResourceNotFoundException("Alert not found with id: " + alertId));
        verifyFarmMembership(alert.getFarm().getId(), authenticatedUserId);

        alert.setIsRead(true);
        Alert updated = alertRepository.save(alert);
        return AlertResponse.fromEntity(updated);
    }

    @Transactional
    public void resolveOfflineAlertsForDevice(Device device) {
        if (device == null || device.getId() == null) return;
        List<Alert> offlineAlerts = alertRepository.findByDeviceIdAndIsReadFalseAndAlertType(device.getId(), "DEVICE_OFFLINE");
        for (Alert alert : offlineAlerts) {
            alert.setIsRead(true);
            alertRepository.save(alert);
        }
    }
}
