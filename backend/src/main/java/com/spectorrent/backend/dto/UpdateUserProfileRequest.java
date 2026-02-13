package com.spectorrent.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateUserProfileRequest {

    @NotBlank
    private String fullName;

    private String phone;

    private String companyName;

    private String description;

    private String region;

    private String avatarUrl;
}
