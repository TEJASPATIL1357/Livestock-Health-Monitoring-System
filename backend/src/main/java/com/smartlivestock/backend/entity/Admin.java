package com.smartlivestock.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Data
@EqualsAndHashCode(callSuper = true)
@Table(name = "admins")
public class Admin extends User {
    // Admin specific fields can be added here in the future
}
