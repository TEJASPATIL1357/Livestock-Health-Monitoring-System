package com.smartlivestock.backend.config;

import com.smartlivestock.backend.entity.SensorDevice;
import com.smartlivestock.backend.repository.SensorDeviceRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@Component
public class ApiKeyAuthFilter extends OncePerRequestFilter {

    private final SensorDeviceRepository deviceRepository;

    public ApiKeyAuthFilter(SensorDeviceRepository deviceRepository) {
        this.deviceRepository = deviceRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        String path = request.getRequestURI();
        if (path.startsWith("/api/v1/devices/register")) {
            // Devices registering themselves don't have API keys yet, handled via user auth or openly
            filterChain.doFilter(request, response);
            return;
        }

        if (path.startsWith("/api/v1/sensors/")) {
            String apiKeyHeader = request.getHeader("X-API-KEY");
            String deviceIdHeader = request.getHeader("X-DEVICE-ID"); // Optional helper for faster queries

            if (apiKeyHeader != null) {
                // If deviceId is provided, we query by both, otherwise we search by apiKey
                Optional<SensorDevice> deviceOpt = (deviceIdHeader != null) 
                        ? deviceRepository.findByDeviceIdAndApiKey(deviceIdHeader, apiKeyHeader)
                        : deviceRepository.findByApiKey(apiKeyHeader);

                if (deviceOpt.isPresent()) {
                    SensorDevice device = deviceOpt.get();
                    // Set device as authenticated IoT entity for this request
                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                            "DEVICE_" + device.getDeviceId(), null, List.of(new SimpleGrantedAuthority("ROLE_DEVICE"))
                    );
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    filterChain.doFilter(request, response);
                    return;
                } else {
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.getWriter().write("Invalid or Missing Sensor API_KEY for this operation");
                    return;
                }
            }
            // If it's a sensor route and no API key, let JwtFilter handle it or fail
        }

        filterChain.doFilter(request, response);
    }
}
