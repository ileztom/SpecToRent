package com.spectorrent.backend.dto;

import com.spectorrent.backend.domain.User;
import com.spectorrent.backend.domain.UserRole;
import lombok.Data;

@Data
public class UserDto {
    private Long id;
    private String email;
    private String fullName;
    private UserRole role;
    private String phone;
    private String companyName;
    private String description;
    private String region;
    private String avatarUrl;

    public static UserDto fromEntity(User user) {
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setFullName(user.getFullName());
        dto.setRole(user.getRole());
        dto.setPhone(user.getPhone());
        dto.setCompanyName(user.getCompanyName());
        dto.setDescription(user.getDescription());
        dto.setRegion(user.getRegion());
        dto.setAvatarUrl(user.getAvatarUrl());
        return dto;
    }
}
