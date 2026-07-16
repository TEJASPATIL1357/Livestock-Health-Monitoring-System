package com.smartlivestock.backend.dto;

import com.smartlivestock.backend.entity.User;
import lombok.Data;

@Data
public class RegisterRequest {
    private String name;
    private String phone;
    private String email;
    private String password;
    private User.Role role;
}
