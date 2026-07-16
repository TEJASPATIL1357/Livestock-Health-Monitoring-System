package com.smartlivestock.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Data
@Table(name = "milk_productions")
public class MilkProduction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "animal_id")
    private Animal animal;

    private LocalDate date;
    
    @Enumerated(EnumType.STRING)
    private Session session;

    private Double quantityInLiters;
    
    private Double fatPercentage;
    
    private Double snfPercentage;

    public enum Session {
        MORNING,
        EVENING
    }
}
