package com.smartlivestock.backend.service;

import com.smartlivestock.backend.dto.ChatRequestDto;

public interface ChatService {
    String processMessage(ChatRequestDto requestDto);
}
