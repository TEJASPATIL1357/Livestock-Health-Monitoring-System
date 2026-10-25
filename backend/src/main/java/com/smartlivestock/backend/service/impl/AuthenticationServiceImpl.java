package com.smartlivestock.backend.service.impl;

import com.smartlivestock.backend.dto.JwtAuthenticationResponse;
import com.smartlivestock.backend.dto.LoginRequest;
import com.smartlivestock.backend.entity.User;
import com.smartlivestock.backend.repository.UserRepository;
import com.smartlivestock.backend.service.AuthenticationService;
import com.smartlivestock.backend.service.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;
import java.util.Optional;

@Service
@Slf4j
public class AuthenticationServiceImpl implements AuthenticationService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthenticationServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Override
    public JwtAuthenticationResponse login(LoginRequest loginRequest) {
        Optional<User> userOpt = userRepository.findByEmail(loginRequest.getUsername());
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByUsername(loginRequest.getUsername());
        }

        User user = userOpt.orElseThrow(() -> {
            log.warn("AUDIT: Failed login attempt for username/email: {} - User not found", loginRequest.getUsername());
            return new RuntimeException("Invalid credentials");
        });

        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            log.warn("AUDIT: Failed login attempt for user: {} - Incorrect password", user.getUsername());
            throw new RuntimeException("Invalid credentials");
        }

        if (user.getStatus() == User.Status.PENDING) {
            log.warn("AUDIT: Failed login attempt for user: {} - Account PENDING", user.getUsername());
            throw new RuntimeException("Login denied. Your account is PENDING admin approval.");
        } else if (user.getStatus() == User.Status.REJECTED) {
            log.warn("AUDIT: Failed login attempt for user: {} - Account REJECTED", user.getUsername());
            throw new RuntimeException("Your account has been rejected.");
        }

        log.info("AUDIT: Successful login for user: {}", user.getUsername());

        String jwt = jwtService.generateToken(user);
        return new JwtAuthenticationResponse(jwt, "Bearer", user.getRole().name());
    }

    @Override
    public String register(com.smartlivestock.backend.dto.RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already in use");
        }

        User user;
        if (request.getRole() == User.Role.VETERINARY_DOCTOR) {
            user = new com.smartlivestock.backend.entity.Doctor();
        } else if (request.getRole() == User.Role.ADMIN) {
            user = new com.smartlivestock.backend.entity.Admin();
        } else {
            user = new com.smartlivestock.backend.entity.Farmer();
        }

        user.setUsername(request.getName() != null ? request.getName().replace(" ", "_").toLowerCase() : "user_" + System.currentTimeMillis());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole() != null ? request.getRole() : User.Role.FARMER);
        
        if (user.getRole() == User.Role.ADMIN) {
            user.setStatus(User.Status.APPROVED);
        } else {
            user.setStatus(User.Status.PENDING);
        }

        userRepository.save(user);
        return "User registered successfully";
    }
}

