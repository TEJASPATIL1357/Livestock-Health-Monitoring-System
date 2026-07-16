package com.smartlivestock.backend.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.smartlivestock.backend.dto.PromptContext;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class GeminiProvider implements AiProvider {

    @Value("${gemini.api.key:}")
    private String apiKey;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public GeminiProvider() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    @Override
    public boolean isAvailable() {
        return apiKey != null && !apiKey.trim().isEmpty();
    }

    @Override
    public String generateResponse(PromptContext context) {
        if (!isAvailable()) {
            throw new IllegalStateException("Gemini API Key is not configured.");
        }

        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey;

        try {
            // Build the system prompt
            String systemPrompt = "You are an expert veterinary AI agent specialized in livestock health, dairy operations, and animal research. " +
                    "Analyze the provided context and the user's question to generate a highly professional, clinical response. " +
                    "Always structure your response using Markdown with these sections (if applicable): " +
                    "### Health Summary\n### Possible Causes\n### Recommended Actions\n### Urgency Level\n\n" +
                    "CRITICAL SAFETY RULE: You must never claim to definitively diagnose diseases. Always end your response with: " +
                    "*\"Disclaimer: I am an AI assistant. Please consult a qualified veterinarian for a confirmed diagnosis and treatment plan.\"*";

            // Build the user prompt
            StringBuilder userPrompt = new StringBuilder();
            userPrompt.append("User Question: ").append(context.getUserMessage()).append("\n\n");
            
            if (context.getAnimalName() != null) {
                userPrompt.append("--- ANIMAL CONTEXT ---\n");
                userPrompt.append("Name: ").append(context.getAnimalName()).append(" (").append(context.getTagNumber()).append(")\n");
                userPrompt.append("Species: ").append(context.getAnimalSpecies()).append("\n");
                userPrompt.append("Current Temp: ").append(context.getCurrentTemperature()).append("°C\n");
                userPrompt.append("Current Activity: ").append(context.getCurrentActivity()).append("%\n");
                userPrompt.append("Milk Yield: ").append(context.getMilkYield()).append(" L/day\n");
                userPrompt.append("System Health Status: ").append(context.getHealthStatus()).append("\n");
                
                if (context.getRecentAlerts() != null && !context.getRecentAlerts().isEmpty()) {
                    userPrompt.append("Recent Alerts: ").append(String.join(", ", context.getRecentAlerts())).append("\n");
                }
                userPrompt.append("----------------------\n\n");
            }
            
            userPrompt.append("Please respond in the following language: ").append(context.getLanguage());

            // Build the JSON request body matching Gemini API spec
            ObjectNode rootNode = objectMapper.createObjectNode();
            
            // Add system instructions
            ObjectNode systemInstructionNode = rootNode.putObject("systemInstruction");
            ArrayNode sysParts = systemInstructionNode.putArray("parts");
            sysParts.addObject().put("text", systemPrompt);

            // Add contents
            ArrayNode contentsArray = rootNode.putArray("contents");
            ObjectNode userContentNode = contentsArray.addObject();
            userContentNode.put("role", "user");
            ArrayNode partsArray = userContentNode.putArray("parts");
            partsArray.addObject().put("text", userPrompt.toString());

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<String> request = new HttpEntity<>(objectMapper.writeValueAsString(rootNode), headers);

            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);
            
            JsonNode responseNode = objectMapper.readTree(response.getBody());
            return responseNode.path("candidates").get(0)
                    .path("content").path("parts").get(0)
                    .path("text").asText();

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to generate response from Gemini: " + e.getMessage());
        }
    }
}
