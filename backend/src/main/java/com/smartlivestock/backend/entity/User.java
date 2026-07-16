package com.smartlivestock.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Entity
@Data
@Table(name = "users", indexes = {
    @Index(name = "idx_user_email", columnList = "email"),
    @Index(name = "idx_user_username", columnList = "username")
})
@Inheritance(strategy = InheritanceType.JOINED)
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(unique = true)
    private String username;
    
    @NotBlank
    private String password;
    
    @NotBlank
    @Email
    @Column(unique = true)
    private String email;

    @Column(name = "preferred_language")
    private String preferredLanguage;

    @Enumerated(EnumType.STRING)
    private Role role;

    @Enumerated(EnumType.STRING)
    private Status status = Status.PENDING;

    public enum Role {
        ADMIN,
        FARMER,
        VETERINARY_DOCTOR
    }

    public enum Status {
        PENDING,
        APPROVED,
        REJECTED
    }
}
