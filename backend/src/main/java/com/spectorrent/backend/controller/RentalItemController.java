package com.spectorrent.backend.controller;

import com.spectorrent.backend.domain.RentalItem;
import com.spectorrent.backend.domain.RentalRequest;
import com.spectorrent.backend.repository.RentalItemRepository;
import com.spectorrent.backend.repository.RentalRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/items")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class RentalItemController {

    private final RentalItemRepository rentalItemRepository;
    private final RentalRequestRepository rentalRequestRepository;

    @GetMapping
    public ResponseEntity<List<RentalItem>> getAll() {
        return ResponseEntity.ok(rentalItemRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<RentalItem> create(@RequestBody RentalItem item) {
        if (item.getStatus() == null) {
            item.setStatus("AVAILABLE");
        }
        return ResponseEntity.ok(rentalItemRepository.save(item));
    }

    @GetMapping("/{id}")
    public ResponseEntity<RentalItem> getById(@PathVariable Long id) {
        return rentalItemRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<RentalItem> update(@PathVariable Long id, @RequestBody RentalItem updated) {
        return rentalItemRepository.findById(id)
                .map(existing -> {
                    existing.setTitle(updated.getTitle());
                    existing.setDescription(updated.getDescription());
                    existing.setLocation(updated.getLocation());
                    existing.setCategory(updated.getCategory());
                    existing.setDailyPrice(updated.getDailyPrice());
                    existing.setStatus(updated.getStatus());
                    existing.setOwner(updated.getOwner());
                    return ResponseEntity.ok(rentalItemRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        if (!rentalItemRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        
        // Check for active requests - only NEW and APPROVED are considered active
        List<String> activeStatuses = Arrays.asList("NEW", "APPROVED");
        List<RentalRequest> activeRequests = rentalRequestRepository.findByItemIdAndStatusIn(id, activeStatuses);
        
        if (!activeRequests.isEmpty()) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Невозможно удалить объявление: есть активные заявки на аренду"));
        }
        
        // Delete all inactive requests first (REJECTED, CANCELED, COMPLETED, EARLY_COMPLETED)
        List<RentalRequest> allRequests = rentalRequestRepository.findByItemId(id);
        for (RentalRequest request : allRequests) {
            rentalRequestRepository.delete(request);
        }
        
        rentalItemRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
