package com.spectorrent.backend.dto;

import com.spectorrent.backend.domain.User;
import com.spectorrent.backend.domain.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateUserRequest {

    @Email
    @NotBlank
    private String email;

    @NotBlank
    @Size(min = 4, max = 255)
    private String password;

    @NotBlank
    private String fullName;

    private UserRole role = UserRole.RENTER;

    public User toEntity() {
        return User.builder()
                .email(email)
                .password(password)
                .fullName(fullName)
                .role(role)
                .build();
    }
}
