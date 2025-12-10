package com.spectorrent.backend.service;

import com.spectorrent.backend.domain.User;
import com.spectorrent.backend.dto.CreateUserRequest;
import com.spectorrent.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public User register(CreateUserRequest request) {
        // Тут можно добавить проверку уникальности email, шифрование пароля и т.д.
        userRepository.findByEmail(request.getEmail())
                .ifPresent(u -> {
                    throw new IllegalArgumentException("User with this email already exists");
                });

        User user = request.toEntity();
        return userRepository.save(user);
    }

    public List<User> findAll() {
        return userRepository.findAll();
    }
}
