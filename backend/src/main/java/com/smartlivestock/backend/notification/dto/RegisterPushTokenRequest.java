package com.smartlivestock.backend.notification.dto;

import jakarta.validation.constraints.NotBlank;

public class RegisterPushTokenRequest {

    @NotBlank(message = "token is required")
    private String token;

    private String platform = "ANDROID";

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getPlatform() { return platform; }
    public void setPlatform(String platform) { this.platform = platform; }
}
