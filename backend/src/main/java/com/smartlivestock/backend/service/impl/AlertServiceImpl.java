package com.smartlivestock.backend.service.impl;

import com.smartlivestock.backend.dto.AlertDto;
import com.smartlivestock.backend.service.AlertService;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class AlertServiceImpl implements AlertService {

    @Override
    public List<AlertDto> getAlertsByFarmer(Long farmerId) {
        return new ArrayList<>();
    }

    @Override
    public void markAlertAsRead(Long alertId) {
        // Mock Implementation
    }
}
