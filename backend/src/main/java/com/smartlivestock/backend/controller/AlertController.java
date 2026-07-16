package com.smartlivestock.backend.controller;

import com.smartlivestock.backend.dto.AlertDto;
import com.smartlivestock.backend.service.AlertService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/alerts")
public class AlertController {

    private final AlertService alertService;

    public AlertController(AlertService alertService) {
        this.alertService = alertService;
    }

    @GetMapping("/farmer/{farmerId}")
    public ResponseEntity<List<AlertDto>> getAlertsByFarmer(@PathVariable Long farmerId) {
        return ResponseEntity.ok(alertService.getAlertsByFarmer(farmerId));
    }

    @PutMapping("/{alertId}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long alertId) {
        alertService.markAlertAsRead(alertId);
        return ResponseEntity.ok().build();
    }
}
