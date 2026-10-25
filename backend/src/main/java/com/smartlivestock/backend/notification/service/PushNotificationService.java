package com.smartlivestock.backend.notification.service;

import com.smartlivestock.backend.common.exception.ResourceNotFoundException;
import com.smartlivestock.backend.notification.dto.RegisterPushTokenRequest;
import com.smartlivestock.backend.notification.entity.PushToken;
import com.smartlivestock.backend.notification.repository.PushTokenRepository;
import com.smartlivestock.backend.user.entity.User;
import com.smartlivestock.backend.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class PushNotificationService {

    private final PushTokenRepository pushTokenRepository;
    private final UserRepository userRepository;

    public PushNotificationService(
            PushTokenRepository pushTokenRepository,
            UserRepository userRepository
    ) {
        this.pushTokenRepository = pushTokenRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public void registerToken(RegisterPushTokenRequest request, UUID authenticatedUserId) {
        User user = userRepository.findById(authenticatedUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + authenticatedUserId));

        PushToken tokenObj = pushTokenRepository.findByToken(request.getToken())
                .orElseGet(() -> {
                    PushToken t = new PushToken();
                    t.setToken(request.getToken());
                    return t;
                });

        tokenObj.setUser(user);
        tokenObj.setPlatform(request.getPlatform() != null ? request.getPlatform() : "ANDROID");
        pushTokenRepository.save(tokenObj);
    }
}
