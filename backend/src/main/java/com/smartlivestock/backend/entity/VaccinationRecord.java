package com.smartlivestock.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Data
@Table(name = "vaccination_records")
public class VaccinationRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "animal_id")
    private Animal animal;

    private String vaccineName;
    
    private LocalDate dateAdministered;
    
    private LocalDate nextDueDate;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "administered_by")
    private Farmer administeredBy; // using Farmer (VETERINARY_DOCTOR role)
}
