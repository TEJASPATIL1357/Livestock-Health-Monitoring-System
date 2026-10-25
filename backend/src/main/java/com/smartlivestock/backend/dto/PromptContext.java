package com.smartlivestock.backend.dto;

import java.util.List;
import java.util.Map;

public class PromptContext {
    private String userMessage;
    private String language;
    private String animalName;
    private String animalSpecies;
    private String tagNumber;
    private Double currentTemperature;
    private Double currentActivity;
    private Double milkYield;
    private String healthStatus;
    private List<String> recentAlerts;
    private List<Map<String, Object>> recentHistory;
    private String previousConversationSummary;

    // Getters and Setters
    public String getUserMessage() { return userMessage; }
    public void setUserMessage(String userMessage) { this.userMessage = userMessage; }
    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }
    public String getAnimalName() { return animalName; }
    public void setAnimalName(String animalName) { this.animalName = animalName; }
    public String getAnimalSpecies() { return animalSpecies; }
    public void setAnimalSpecies(String animalSpecies) { this.animalSpecies = animalSpecies; }
    public String getTagNumber() { return tagNumber; }
    public void setTagNumber(String tagNumber) { this.tagNumber = tagNumber; }
    public Double getCurrentTemperature() { return currentTemperature; }
    public void setCurrentTemperature(Double currentTemperature) { this.currentTemperature = currentTemperature; }
    public Double getCurrentActivity() { return currentActivity; }
    public void setCurrentActivity(Double currentActivity) { this.currentActivity = currentActivity; }
    public Double getMilkYield() { return milkYield; }
    public void setMilkYield(Double milkYield) { this.milkYield = milkYield; }
    public String getHealthStatus() { return healthStatus; }
    public void setHealthStatus(String healthStatus) { this.healthStatus = healthStatus; }
    public List<String> getRecentAlerts() { return recentAlerts; }
    public void setRecentAlerts(List<String> recentAlerts) { this.recentAlerts = recentAlerts; }
    public List<Map<String, Object>> getRecentHistory() { return recentHistory; }
    public void setRecentHistory(List<Map<String, Object>> recentHistory) { this.recentHistory = recentHistory; }
    public String getPreviousConversationSummary() { return previousConversationSummary; }
    public void setPreviousConversationSummary(String previousConversationSummary) { this.previousConversationSummary = previousConversationSummary; }
}
