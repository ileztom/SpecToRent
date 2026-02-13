package com.spectorrent.backend.repository;

import com.spectorrent.backend.domain.ContractCounter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ContractCounterRepository extends JpaRepository<ContractCounter, Long> {
}
