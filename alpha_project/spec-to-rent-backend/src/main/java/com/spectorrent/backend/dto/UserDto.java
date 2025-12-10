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

    public static UserDto fromEntity(User user) {
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setFullName(user.getFullName());
        dto.setRole(user.getRole());
        return dto;
    }
}
