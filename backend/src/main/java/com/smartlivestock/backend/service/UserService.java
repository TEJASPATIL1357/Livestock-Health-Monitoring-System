package com.smartlivestock.backend.service;

import com.smartlivestock.backend.entity.User;

import java.util.List;

public interface UserService {
    List<User> getPendingUsers();
    User approveUser(Long id);
    User rejectUser(Long id);
}
