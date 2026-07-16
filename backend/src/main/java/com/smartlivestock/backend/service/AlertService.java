package com.smartlivestock.backend.service;

import com.smartlivestock.backend.dto.AlertDto;
import java.util.List;

public interface AlertService {
    List<AlertDto> getAlertsByFarmer(Long farmerId);
    void markAlertAsRead(Long alertId);
}
