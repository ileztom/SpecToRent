package com.spectorrent.backend.controller;

import com.spectorrent.backend.domain.ChatMessage;
import com.spectorrent.backend.domain.User;
import com.spectorrent.backend.repository.ChatMessageRepository;
import com.spectorrent.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ChatRestController {

    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @GetMapping("/{roomId}/messages")
    public ResponseEntity<List<ChatMessage>> getMessages(@PathVariable String roomId) {
        return ResponseEntity.ok(chatMessageRepository.findByRoomIdOrderByCreatedAtAsc(roomId));
    }

    @PostMapping("/{roomId}/messages")
    public ResponseEntity<?> sendMessage(@PathVariable String roomId, @RequestBody Map<String, Object> body) {
        try {
            Object senderIdObj = body.get("senderId");
            String content = (String) body.get("content");

            if (senderIdObj == null || content == null || content.isBlank()) {
                return ResponseEntity.badRequest().body("senderId and content are required");
            }

            Long senderId = Long.valueOf(senderIdObj.toString());
            User sender = userRepository.findById(senderId).orElse(null);

            ChatMessage message = ChatMessage.builder()
                    .roomId(roomId)
                    .sender(sender)
                    .content(content)
                    .createdAt(Instant.now())
                    .build();

            ChatMessage saved = chatMessageRepository.save(message);

            // Build safe payload for WebSocket broadcast (avoids lazy-loading issues)
            Map<String, Object> broadcastPayload = Map.of(
                    "id", saved.getId(),
                    "roomId", saved.getRoomId(),
                    "content", saved.getContent(),
                    "createdAt", saved.getCreatedAt().toString(),
                    "sender", sender != null ? Map.of(
                            "id", sender.getId(),
                            "fullName", sender.getFullName() != null ? sender.getFullName() : "",
                            "role", sender.getRole() != null ? sender.getRole().name() : ""
                    ) : Map.of()
            );
            try {
                messagingTemplate.convertAndSend("/topic/chat/" + roomId, broadcastPayload);
            } catch (Exception e) {
                System.err.println("Failed to broadcast chat message: " + e.getMessage());
            }

            return ResponseEntity.ok(Map.of(
                    "id", saved.getId(),
                    "roomId", saved.getRoomId(),
                    "content", saved.getContent(),
                    "createdAt", saved.getCreatedAt().toString(),
                    "sender", sender != null ? Map.of(
                            "id", sender.getId(),
                            "fullName", sender.getFullName() != null ? sender.getFullName() : "",
                            "role", sender.getRole() != null ? sender.getRole().name() : ""
                    ) : Map.of()
            ));
        } catch (Exception e) {
            System.err.println("Error sending chat message: " + e.getMessage());
            return ResponseEntity.badRequest().body("Не удалось отправить сообщение: " + e.getMessage());
        }
    }
}
