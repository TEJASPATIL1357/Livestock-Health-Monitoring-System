package com.smartlivestock.backend.controller;

import com.smartlivestock.backend.entity.User;
import com.smartlivestock.backend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminController {

    private final UserService userService;

    public AdminController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/users/pending")
    public ResponseEntity<List<User>> getPendingUsers() {
        return ResponseEntity.ok(userService.getPendingUsers());
    }

    @PutMapping("/users/{id}/approve")
    public ResponseEntity<User> approveUser(@PathVariable Long id) {
        return ResponseEntity.ok(userService.approveUser(id));
    }

    @PutMapping("/users/{id}/reject")
    public ResponseEntity<User> rejectUser(@PathVariable Long id) {
        return ResponseEntity.ok(userService.rejectUser(id));
    }
}
