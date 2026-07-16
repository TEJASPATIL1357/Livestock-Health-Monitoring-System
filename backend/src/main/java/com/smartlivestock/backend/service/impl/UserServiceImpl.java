package com.smartlivestock.backend.service.impl;

import com.smartlivestock.backend.entity.User;
import com.smartlivestock.backend.repository.UserRepository;
import com.smartlivestock.backend.service.UserService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    public UserServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public List<User> getPendingUsers() {
        return userRepository.findByStatus(User.Status.PENDING);
    }

    @Override
    public User approveUser(Long id) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        user.setStatus(User.Status.APPROVED);
        return userRepository.save(user);
    }

    @Override
    public User rejectUser(Long id) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        user.setStatus(User.Status.REJECTED);
        return userRepository.save(user);
    }
}
