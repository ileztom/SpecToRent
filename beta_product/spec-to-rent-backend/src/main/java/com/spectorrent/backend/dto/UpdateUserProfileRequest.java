package com.spectorrent.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateUserProfileRequest {

    @NotBlank
    private String fullName;
}

