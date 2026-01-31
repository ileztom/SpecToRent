package com.spectorrent.backend.domain;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "rental_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RentalItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    private String description;

    /**
     * Город / регион для фильтрации (Москва, СПб и т.п.)
     */
    private String region;

    /**
     * Точный адрес или любая текстовая локация
     */
    private String location;

    private String category;

    /**
     * Тип техники (экскаватор-погрузчик, автокран и т.п.)
     */
    private String type;

    /**
     * Ссылка на изображение техники
     */
    private String imageUrl;

    /**
     * Доступное количество единиц техники
     */
    private Integer availableCount;

    @Column(precision = 12, scale = 2)
    private BigDecimal dailyPrice;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id")
    private User owner;

    @Column(nullable = false)
    private String status; // e.g. AVAILABLE, RENTED, SERVICE
}
