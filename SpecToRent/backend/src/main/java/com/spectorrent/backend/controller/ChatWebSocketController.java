package com.spectorrent.backend.controller;

import com.spectorrent.backend.domain.ChatMessage;
import com.spectorrent.backend.domain.User;
import com.spectorrent.backend.repository.ChatMessageRepository;
import com.spectorrent.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@Controller
@RequiredArgsConstructor
public class ChatWebSocketController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;

    @MessageMapping("/chat/{roomId}")
    public void sendMessage(@DestinationVariable String roomId, ChatMessage incoming) {
        try {
            incoming.setRoomId(roomId);
            incoming.setCreatedAt(Instant.now());
            incoming.setId(null);

            // Load sender from database (incoming only has id)
            User sender = null;
            if (incoming.getSender() != null && incoming.getSender().getId() != null) {
                sender = userRepository.findById(incoming.getSender().getId()).orElse(null);
                incoming.setSender(sender);
            }

            ChatMessage saved = chatMessageRepository.save(incoming);

            // Build a safe Map payload to broadcast (avoids Hibernate lazy-loading issues)
            Map<String, Object> payload = new HashMap<>();
            payload.put("id", saved.getId());
            payload.put("roomId", saved.getRoomId());
            payload.put("content", saved.getContent());
            payload.put("createdAt", saved.getCreatedAt().toString());
            if (sender != null) {
                Map<String, Object> senderMap = new HashMap<>();
                senderMap.put("id", sender.getId());
                senderMap.put("fullName", sender.getFullName() != null ? sender.getFullName() : "");
                senderMap.put("role", sender.getRole() != null ? sender.getRole().name() : "");
                payload.put("sender", senderMap);
            }

            messagingTemplate.convertAndSend("/topic/chat/" + roomId, payload);
            System.out.println("Chat message saved and broadcast to /topic/chat/" + roomId);
        } catch (Exception e) {
            System.err.println("Error in WebSocket chat handler: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
