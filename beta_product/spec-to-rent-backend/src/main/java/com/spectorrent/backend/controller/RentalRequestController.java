package com.spectorrent.backend.controller;

import com.spectorrent.backend.domain.RentalRequest;
import com.spectorrent.backend.repository.RentalRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/requests")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class RentalRequestController {

    private final RentalRequestRepository rentalRequestRepository;

    @GetMapping
    public ResponseEntity<List<RentalRequest>> getAll() {
        return ResponseEntity.ok(rentalRequestRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<RentalRequest> create(@RequestBody RentalRequest request) {
        if (request.getStatus() == null) {
            request.setStatus("NEW");
        }
        return ResponseEntity.ok(rentalRequestRepository.save(request));
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
