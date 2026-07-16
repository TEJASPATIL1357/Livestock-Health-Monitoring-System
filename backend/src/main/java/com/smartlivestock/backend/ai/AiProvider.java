package com.smartlivestock.backend.ai;

import com.smartlivestock.backend.dto.PromptContext;

public interface AiProvider {
    /**
     * Generates a clinical intelligence response based on context.
     * @param context The fully constructed PromptContext.
     * @return Formatted Markdown response.
     */
    String generateResponse(PromptContext context);
    
    /**
     * @return true if this provider is currently available/configured.
     */
    boolean isAvailable();
}
