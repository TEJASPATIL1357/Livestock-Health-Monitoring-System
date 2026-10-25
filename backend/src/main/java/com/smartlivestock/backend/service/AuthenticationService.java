package com.smartlivestock.backend.service;

import com.smartlivestock.backend.dto.JwtAuthenticationResponse;
import com.smartlivestock.backend.dto.LoginRequest;

public interface AuthenticationService {
    JwtAuthenticationResponse login(LoginRequest loginRequest);
    String register(com.smartlivestock.backend.dto.RegisterRequest request);
}
