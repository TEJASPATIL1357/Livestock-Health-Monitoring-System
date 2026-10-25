package com.smartlivestock.backend.entity;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "disease_knowledge")
public class DiseaseKnowledge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String diseaseName;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(columnDefinition = "TEXT")
    private String symptoms;
    
    private String severity; // LOW, MEDIUM, HIGH, CRITICAL
    
    @Column(columnDefinition = "TEXT")
    private String recommendations;
    
    @Column(columnDefinition = "TEXT")
    private String emergencyAction;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "disease_supported_languages", joinColumns = @JoinColumn(name = "disease_id"))
    @Column(name = "language_code")
    private List<String> supportedLanguages;

    public DiseaseKnowledge() {}

    public DiseaseKnowledge(String diseaseName, String description, String symptoms, String severity, String recommendations, String emergencyAction) {
        this.diseaseName = diseaseName;
        this.description = description;
        this.symptoms = symptoms;
        this.severity = severity;
        this.recommendations = recommendations;
        this.emergencyAction = emergencyAction;
        this.supportedLanguages = List.of("en", "hi", "mr", "gu", "ta", "te", "kn", "ml", "bn", "pa");
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getDiseaseName() { return diseaseName; }
    public void setDiseaseName(String diseaseName) { this.diseaseName = diseaseName; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public String getSymptoms() { return symptoms; }
    public void setSymptoms(String symptoms) { this.symptoms = symptoms; }
    
    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }
    
    public String getRecommendations() { return recommendations; }
    public void setRecommendations(String recommendations) { this.recommendations = recommendations; }
    
    public String getEmergencyAction() { return emergencyAction; }
    public void setEmergencyAction(String emergencyAction) { this.emergencyAction = emergencyAction; }
    
    public List<String> getSupportedLanguages() { return supportedLanguages; }
    public void setSupportedLanguages(List<String> supportedLanguages) { this.supportedLanguages = supportedLanguages; }
}
