package com.spectorrent.backend.repository;

import com.spectorrent.backend.domain.RentalRequest;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RentalRequestRepository extends JpaRepository<RentalRequest, Long> {
}
