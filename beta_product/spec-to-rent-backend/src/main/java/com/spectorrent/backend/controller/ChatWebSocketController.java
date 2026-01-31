package com.spectorrent.backend.controller;

import com.spectorrent.backend.domain.ChatMessage;
import com.spectorrent.backend.repository.ChatMessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.time.Instant;

@Controller
@RequiredArgsConstructor
public class ChatWebSocketController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatMessageRepository chatMessageRepository;

    @MessageMapping("/chat/{roomId}")
    public void sendMessage(@DestinationVariable String roomId, ChatMessage incoming) {
        incoming.setRoomId(roomId);
        if (incoming.getCreatedAt() == null) {
            incoming.setCreatedAt(Instant.now());
        }
        ChatMessage saved = chatMessageRepository.save(incoming);
        messagingTemplate.convertAndSend("/topic/chat/" + roomId, saved);
    }
}
