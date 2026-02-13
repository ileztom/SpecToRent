package com.spectorrent.backend.controller;

import com.spectorrent.backend.domain.ChatMessage;
import com.spectorrent.backend.domain.RentalItem;
import com.spectorrent.backend.domain.RentalRequest;
import com.spectorrent.backend.domain.User;
import com.spectorrent.backend.dto.CreateRentalRequestDto;
import com.spectorrent.backend.repository.ChatMessageRepository;
import com.spectorrent.backend.repository.RentalItemRepository;
import com.spectorrent.backend.repository.RentalRequestRepository;
import com.spectorrent.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/requests")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class RentalRequestController {

    private final RentalRequestRepository rentalRequestRepository;
    private final RentalItemRepository rentalItemRepository;
    private final UserRepository userRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @GetMapping
    public ResponseEntity<List<RentalRequest>> getAll() {
        return ResponseEntity.ok(rentalRequestRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody CreateRentalRequestDto request) {
        try {
            if (request.getRenterId() == null || request.getItemId() == null) {
                return ResponseEntity.badRequest().body("renterId and itemId are required");
            }

            User renter = userRepository.findById(request.getRenterId())
                    .orElseThrow(() -> new IllegalArgumentException("Арендатор не найден"));

            RentalItem item = rentalItemRepository.findById(request.getItemId())
                    .orElseThrow(() -> new IllegalArgumentException("Объявление не найдено"));

            LocalDate startDate = request.getStartDate();
            LocalDate endDate = request.getEndDate();

            if (startDate != null && endDate != null && endDate.isBefore(startDate)) {
                throw new IllegalArgumentException("Дата окончания не может быть раньше даты начала");
            }

            RentalRequest newRequest = RentalRequest.builder()
                    .renter(renter)
                    .item(item)
                    .startDate(startDate)
                    .endDate(endDate)
                    .status("NEW")
                    .quantity(request.getQuantity() == null ? 1 : request.getQuantity())
                    .address(request.getAddress())
                    .build();

            RentalRequest saved = rentalRequestRepository.save(newRequest);
        
            // Send notification to owner via chat
            try {
                if (item.getOwner() != null) {
                    String renterName = renter.getFullName();
                    String itemName = item.getTitle();
                    String roomId = String.valueOf(saved.getId());
                    Integer qty = saved.getQuantity() != null ? saved.getQuantity() : 1;

                    String address = saved.getAddress() != null ? saved.getAddress() : "Не указан";

                    // Create system message about new order
                    ChatMessage notification = ChatMessage.builder()
                            .roomId(roomId)
                            .sender(renter)
                            .content(String.format(
                                    "Новая заявка на аренду техники \"%s\" от %s. Количество: %d ед. Период: %s - %s. Адрес: %s",
                                    itemName, renterName, qty, saved.getStartDate(), saved.getEndDate(), address))
                            .createdAt(Instant.now())
                            .build();

                    ChatMessage savedMessage = chatMessageRepository.save(notification);
                    // Use Map for WS broadcast to avoid lazy-loading issues
                    Map<String, Object> msgPayload = new HashMap<>();
                    msgPayload.put("id", savedMessage.getId());
                    msgPayload.put("roomId", savedMessage.getRoomId());
                    msgPayload.put("content", savedMessage.getContent());
                    msgPayload.put("createdAt", savedMessage.getCreatedAt().toString());
                    if (renter != null) {
                        Map<String, Object> sMap = new HashMap<>();
                        sMap.put("id", renter.getId());
                        sMap.put("fullName", renter.getFullName() != null ? renter.getFullName() : "");
                        sMap.put("role", renter.getRole() != null ? renter.getRole().name() : "");
                        msgPayload.put("sender", sMap);
                    }
                    messagingTemplate.convertAndSend("/topic/chat/" + roomId, msgPayload);
                }
            } catch (Exception e) {
                // Log error but don't fail the request creation
                System.err.println("Failed to send chat notification: " + e.getMessage());
            }

            return ResponseEntity.ok(saved);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        } catch (Exception ex) {
            System.err.println("Error creating rental request: " + ex.getMessage());
            return ResponseEntity.badRequest().body("Не удалось создать заявку: " + ex.getMessage());
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        try {
            String newStatus = body.get("status");
            if (newStatus == null) {
                return ResponseEntity.badRequest().body("status is required");
            }

            RentalRequest request = rentalRequestRepository.findById(id).orElse(null);
            if (request == null) {
                return ResponseEntity.notFound().build();
            }

            request.setStatus(newStatus);
            rentalRequestRepository.save(request);

            // Send status change notification to chat
            try {
                String roomId = String.valueOf(id);
                String statusText = switch (newStatus) {
                    case "APPROVED" -> "одобрена";
                    case "REJECTED" -> "отклонена";
                    case "CANCELED" -> "отменена";
                    default -> "обновлена";
                };

                ChatMessage notification = ChatMessage.builder()
                        .roomId(roomId)
                        .sender(null)
                        .content(String.format("Статус заявки изменён: %s", statusText))
                        .createdAt(Instant.now())
                        .build();

                chatMessageRepository.save(notification);
            } catch (Exception e) {
                System.err.println("Failed to send status notification: " + e.getMessage());
            }

            // Return simple JSON — avoids lazy-loading serialization errors
            return ResponseEntity.ok(Map.of("id", id, "status", newStatus));
        } catch (Exception ex) {
            System.err.println("Error updating request status: " + ex.getMessage());
            return ResponseEntity.badRequest().body("Не удалось обновить статус: " + ex.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<RentalRequest> getById(@PathVariable Long id) {
        return rentalRequestRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<RentalRequest> update(@PathVariable Long id, @RequestBody RentalRequest updated) {
        return rentalRequestRepository.findById(id)
                .map(existing -> {
                    existing.setStartDate(updated.getStartDate());
                    existing.setEndDate(updated.getEndDate());
                    existing.setStatus(updated.getStatus());
                    existing.setItem(updated.getItem());
                    existing.setRenter(updated.getRenter());
                    return ResponseEntity.ok(rentalRequestRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!rentalRequestRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        rentalRequestRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
