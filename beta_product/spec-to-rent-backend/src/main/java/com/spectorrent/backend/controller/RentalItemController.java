package com.spectorrent.backend.controller;

import com.spectorrent.backend.domain.RentalItem;
import com.spectorrent.backend.repository.RentalItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/items")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class RentalItemController {

    private final RentalItemRepository rentalItemRepository;

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
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!rentalItemRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        rentalItemRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
