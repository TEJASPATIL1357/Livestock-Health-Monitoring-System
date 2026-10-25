package com.smartlivestock.backend.health;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/health")
public class HealthController {

    private final DataSource dataSource;

    public HealthController(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> checkHealth() {
        Map<String, Object> response = new HashMap<>();
        response.put("service", "smart-livestock-backend");
        response.put("timestamp", Instant.now().toString());

        boolean dbHealthy = false;
        try (Connection connection = dataSource.getConnection()) {
            dbHealthy = connection.isValid(2);
        } catch (Exception e) {
            dbHealthy = false;
        }

        if (dbHealthy) {
            response.put("status", "UP");
            response.put("database", "UP");
            return ResponseEntity.ok(response);
        } else {
            response.put("status", "DOWN");
            response.put("database", "DOWN");
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(response);
        }
    }
}
