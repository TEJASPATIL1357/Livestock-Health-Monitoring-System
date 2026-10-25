package com.smartlivestock.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.util.List;

@Entity
@Data
@EqualsAndHashCode(callSuper = true)
@Table(name = "farmers")
public class Farmer extends User {

    @OneToMany(mappedBy = "farmer", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @lombok.ToString.Exclude
    @lombok.EqualsAndHashCode.Exclude
    private List<Animal> animals;

    @OneToMany(mappedBy = "farmer", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @lombok.ToString.Exclude
    @lombok.EqualsAndHashCode.Exclude
    private List<ChatHistory> chatHistories;
}
