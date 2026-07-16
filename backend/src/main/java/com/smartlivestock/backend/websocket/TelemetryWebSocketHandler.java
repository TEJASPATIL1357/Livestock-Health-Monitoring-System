package com.smartlivestock.backend.websocket;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class TelemetryWebSocketHandler extends TextWebSocketHandler {

    // Thread-safe store for all active WebSocket connections
    private static final Set<WebSocketSession> sessions = ConcurrentHashMap.newKeySet();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        sessions.add(session);
        System.out.println("WebSocket connection established. Session ID: " + session.getId());
        
        // Push initial greetings/acknowledgement
        session.sendMessage(new TextMessage("{\"type\":\"connection_ack\",\"status\":\"connected\"}"));
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        sessions.remove(session);
        System.out.println("WebSocket connection closed. Session ID: " + session.getId());
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        // Echo or process client messages (e.g. IoT updates sent by client sockets)
        System.out.println("Received message: " + message.getPayload());
    }

    /**
     * Broadcasts a JSON payload to all active browser and mobile socket sessions.
     */
    public void broadcast(String payload) {
        TextMessage textMessage = new TextMessage(payload);
        for (WebSocketSession session : sessions) {
            if (session.isOpen()) {
                try {
                    session.sendMessage(textMessage);
                } catch (IOException e) {
                    System.err.println("Failed to broadcast message to session " + session.getId() + ": " + e.getMessage());
                }
            }
        }
    }
}
