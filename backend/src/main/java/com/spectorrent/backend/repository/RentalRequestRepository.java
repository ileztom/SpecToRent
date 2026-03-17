package com.spectorrent.backend.repository;

import com.spectorrent.backend.domain.RentalRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RentalRequestRepository extends JpaRepository<RentalRequest, Long> {
    List<RentalRequest> findByItemId(Long itemId);
    List<RentalRequest> findByItemIdAndStatusIn(Long itemId, List<String> statuses);
}
