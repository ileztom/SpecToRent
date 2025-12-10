package com.spectorrent.backend.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "rental_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RentalRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // who wants to rent
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "renter_id")
    private User renter;

    // what item
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id")
    private RentalItem item;

    private LocalDate startDate;

    private LocalDate endDate;

    @Column(nullable = false)
    private String status; // NEW, APPROVED, REJECTED, CANCELED
}
