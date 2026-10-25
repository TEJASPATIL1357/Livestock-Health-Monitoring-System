package com.smartlivestock.backend.notification.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartlivestock.backend.alert.entity.Alert;
import com.smartlivestock.backend.membership.repository.FarmMembershipRepository;
import com.smartlivestock.backend.notification.entity.PushToken;
import com.smartlivestock.backend.notification.repository.PushTokenRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.*;

@Service
public class ExpoPushNotificationService {

    private static final Logger log = LoggerFactory.getLogger(ExpoPushNotificationService.class);
    private static final String EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

    private final PushTokenRepository pushTokenRepository;
    private final FarmMembershipRepository membershipRepository;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    public ExpoPushNotificationService(
            PushTokenRepository pushTokenRepository,
            FarmMembershipRepository membershipRepository,
            ObjectMapper objectMapper
    ) {
        this.pushTokenRepository = pushTokenRepository;
        this.membershipRepository = membershipRepository;
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(5))
                .build();
    }

    @Async
    public void sendPushNotificationForAlert(Alert alert) {
        if (alert == null || alert.getFarm() == null) return;

        try {
            // Find all active farm members to notify
            List<UUID> userIds = membershipRepository.findUserIdsByFarmId(alert.getFarm().getId());
            if (userIds.isEmpty()) return;

            List<PushToken> tokensToNotify = new ArrayList<>();
            for (UUID userId : userIds) {
                tokensToNotify.addAll(pushTokenRepository.findByUserId(userId));
            }

            if (tokensToNotify.isEmpty()) {
                log.info("No push tokens registered for farm {}", alert.getFarm().getId());
                return;
            }

            List<Map<String, Object>> payloadList = new ArrayList<>();
            Map<String, PushToken> tokenMap = new HashMap<>();

            for (PushToken pushToken : tokensToNotify) {
                String tokenStr = pushToken.getToken();
                if (!isValidExpoToken(tokenStr)) continue;

                Map<String, Object> message = new LinkedHashMap<>();
                message.put("to", tokenStr);
                message.put("title", alert.getTitle());
                message.put("body", alert.getMessage());
                message.put("sound", "default");
                message.put("priority", "CRITICAL".equalsIgnoreCase(alert.getSeverity()) ? "high" : "default");

                Map<String, Object> dataMap = new HashMap<>();
                dataMap.put("alertId", alert.getId() != null ? alert.getId().toString() : "");
                if (alert.getAnimal() != null) {
                    dataMap.put("animalId", alert.getAnimal().getId() != null ? alert.getAnimal().getId().toString() : "");
                }
                message.put("data", dataMap);

                payloadList.add(message);
                tokenMap.put(tokenStr, pushToken);
            }

            if (payloadList.isEmpty()) return;

            String jsonPayload = objectMapper.writeValueAsString(payloadList);

            HttpRequest httpRequest = HttpRequest.newBuilder()
                    .uri(URI.create(EXPO_PUSH_URL))
                    .header("Content-Type", "application/json")
                    .header("Accept", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                    .timeout(Duration.ofSeconds(10))
                    .build();

            HttpResponse<String> response = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200) {
                log.info("Expo Push Notification dispatched successfully for alert {}", alert.getId());
                processExpoResponse(response.body(), tokenMap);
            } else {
                log.warn("Expo Push API returned HTTP {}: {}", response.statusCode(), response.body());
            }

        } catch (Exception e) {
            log.error("Failed to dispatch push notification for alert {}: {}", alert.getId(), e.getMessage());
            // Safe failure: DB alert transaction is NOT affected
        }
    }

    private boolean isValidExpoToken(String token) {
        return token != null && (token.startsWith("ExponentPushToken[") || token.startsWith("ExpoPushToken["));
    }

    private void processExpoResponse(String responseBody, Map<String, PushToken> tokenMap) {
        try {
            JsonNode root = objectMapper.readTree(responseBody);
            JsonNode dataNode = root.get("data");
            if (dataNode != null && dataNode.isArray()) {
                int index = 0;
                List<String> tokenKeys = new ArrayList<>(tokenMap.keySet());
                for (JsonNode item : dataNode) {
                    if (index < tokenKeys.size()) {
                        String tokenStr = tokenKeys.get(index);
                        String status = item.path("status").asText();
                        if ("error".equalsIgnoreCase(status)) {
                            String errorDetail = item.path("details").path("error").asText();
                            if ("DeviceNotRegistered".equalsIgnoreCase(errorDetail)) {
                                log.info("Removing stale Expo push token: {}", tokenStr);
                                PushToken pushTokenObj = tokenMap.get(tokenStr);
                                if (pushTokenObj != null) {
                                    pushTokenRepository.delete(pushTokenObj);
                                }
                            }
                        }
                    }
                    index++;
                }
            }
        } catch (Exception e) {
            log.warn("Error parsing Expo response body: {}", e.getMessage());
        }
    }
}
