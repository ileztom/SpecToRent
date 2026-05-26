package com.spectorrent.backend.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "contract_counter")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContractCounter {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private Long lastNumber;
}
