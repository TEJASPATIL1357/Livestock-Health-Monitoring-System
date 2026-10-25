package com.smartlivestock.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "chat_histories")
public class ChatHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farmer_id")
    private Farmer farmer;

    private String sessionId;
    
    @Column(columnDefinition = "TEXT")
    private String userMessage;
    
    @Column(columnDefinition = "TEXT")
    private String botResponse;
    
    private String detectedIntent;
    
    private String language;
    
    private LocalDateTime timestamp;
}
