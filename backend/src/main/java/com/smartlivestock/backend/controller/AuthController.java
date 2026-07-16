package com.smartlivestock.backend.controller;

import com.smartlivestock.backend.dto.JwtAuthenticationResponse;
import com.smartlivestock.backend.dto.LoginRequest;
import com.smartlivestock.backend.service.AuthenticationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthenticationService authenticationService;

    public AuthController(AuthenticationService authenticationService) {
        this.authenticationService = authenticationService;
    }

    @PostMapping("/login")
    public ResponseEntity<JwtAuthenticationResponse> login(@RequestBody LoginRequest loginRequest) {
        return ResponseEntity.ok(authenticationService.login(loginRequest));
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody com.smartlivestock.backend.dto.RegisterRequest request) {
        return ResponseEntity.ok(authenticationService.register(request));
    }
}
