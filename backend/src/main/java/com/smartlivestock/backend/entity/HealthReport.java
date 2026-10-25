package com.smartlivestock.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "health_reports")
public class HealthReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "animal_id")
    private Animal animal;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "veterinarian_id")
    private Farmer veterinarian; // using Farmer for the VETERINARY_DOCTOR role

    private String diagnosis;
    
    private String recommendationText;
    
    private LocalDateTime dateIssued;
}
