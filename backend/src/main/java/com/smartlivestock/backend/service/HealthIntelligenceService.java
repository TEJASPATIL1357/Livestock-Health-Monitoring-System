package com.smartlivestock.backend.service;

import com.smartlivestock.backend.ai.AiProvider;
import com.smartlivestock.backend.ai.GeminiProvider;
import com.smartlivestock.backend.ai.RuleBasedProvider;
import com.smartlivestock.backend.dto.ChatRequestDto;
import com.smartlivestock.backend.dto.PromptContext;
import com.smartlivestock.backend.entity.ChatHistory;
import com.smartlivestock.backend.entity.Farmer;
import com.smartlivestock.backend.repository.ChatHistoryRepository;
import com.smartlivestock.backend.repository.FarmerRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class HealthIntelligenceService {

    private final AgentContextService contextService;
    private final GeminiProvider geminiProvider;
    private final RuleBasedProvider ruleBasedProvider;
    private final ChatHistoryRepository chatRepository;
    private final FarmerRepository farmerRepository;

    public HealthIntelligenceService(
            AgentContextService contextService,
            GeminiProvider geminiProvider,
            RuleBasedProvider ruleBasedProvider,
            ChatHistoryRepository chatRepository,
            FarmerRepository farmerRepository) {
        this.contextService = contextService;
        this.geminiProvider = geminiProvider;
        this.ruleBasedProvider = ruleBasedProvider;
        this.chatRepository = chatRepository;
        this.farmerRepository = farmerRepository;
    }

    @Transactional
    public String processChat(ChatRequestDto requestDto) {
        String msg = requestDto.getMessage();
        String lang = requestDto.getLanguage() != null ? requestDto.getLanguage() : "en";
        
        if (msg == null || msg.trim().isEmpty()) {
            return "Hello! I am your Animal Health Intelligence Agent. How can I assist you today?";
        }

        // 1. Build context
        PromptContext context = contextService.buildContext(msg, lang, requestDto.getAnimalId());

        // 2. Select AI Provider
        AiProvider activeProvider = geminiProvider.isAvailable() ? geminiProvider : ruleBasedProvider;

        // 3. Generate Response
        String response;
        try {
            response = activeProvider.generateResponse(context);
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("Primary AI Provider failed. Falling back to Rule-Based Provider.");
            response = ruleBasedProvider.generateResponse(context);
        }

        // 4. Save to Memory (ChatHistory)
        ChatHistory history = new ChatHistory();
        history.setUserMessage(msg);
        history.setBotResponse(response);
        history.setLanguage(lang);
        history.setDetectedIntent("AI_GENERATED");
        history.setTimestamp(LocalDateTime.now());
        history.setSessionId(UUID.randomUUID().toString());

        if (requestDto.getFarmerId() != null) {
            Farmer farmer = farmerRepository.findById(requestDto.getFarmerId()).orElse(null);
            history.setFarmer(farmer);
        }

        chatRepository.save(history);

        return response;
    }
}
