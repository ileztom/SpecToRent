package com.spectorrent.backend.repository;

import com.spectorrent.backend.domain.RentalItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RentalItemRepository extends JpaRepository<RentalItem, Long> {
}
