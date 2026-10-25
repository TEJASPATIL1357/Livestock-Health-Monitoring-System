package com.smartlivestock.backend.config;

import com.smartlivestock.backend.entity.User;
import com.smartlivestock.backend.repository.UserRepository;
import com.smartlivestock.backend.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Optional;import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    public JwtAuthenticationFilter(JwtService jwtService, UserRepository userRepository) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        long startTime = System.currentTimeMillis();
        
        final String authHeader = request.getHeader("Authorization");
        
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            logRequest(request, response, startTime);
            return;
        }

        final String jwt = authHeader.substring(7);
        try {
            final String subject = jwtService.extractUsername(jwt); // subject is email or username
            
            if (subject != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                // Try to find user by email or username
                Optional<User> userOpt = userRepository.findByEmail(subject);
                if (userOpt.isEmpty()) {
                    userOpt = userRepository.findByUsername(subject);
                }

                if (userOpt.isPresent() && jwtService.isTokenValid(jwt, userOpt.get())) {
                    User user = userOpt.get();
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            user, null, List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
                    );
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        } catch (Exception e) {
            // Token is invalid/expired
            log.error("JWT Validation Error: {}", e.getMessage());
        }
        
        filterChain.doFilter(request, response);
        logRequest(request, response, startTime);
    }

    private void logRequest(HttpServletRequest request, HttpServletResponse response, long startTime) {
        long duration = System.currentTimeMillis() - startTime;
        log.info("REQUEST: {} {} - Status: {} - Duration: {}ms", 
                request.getMethod(), request.getRequestURI(), response.getStatus(), duration);
    }
}
