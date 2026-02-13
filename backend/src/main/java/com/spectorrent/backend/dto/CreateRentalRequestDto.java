package com.spectorrent.backend.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class CreateRentalRequestDto {

    private Long renterId;

    private Long itemId;

    private LocalDate startDate;

    private LocalDate endDate;

    private Integer quantity;

    private String address;
}

