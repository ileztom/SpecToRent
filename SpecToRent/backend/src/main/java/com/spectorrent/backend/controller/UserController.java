package com.spectorrent.backend.controller;

import com.spectorrent.backend.dto.CreateUserRequest;
import com.spectorrent.backend.dto.UserDto;
import com.spectorrent.backend.dto.UpdateUserProfileRequest;
import com.spectorrent.backend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody CreateUserRequest request) {
        try {
            var user = userService.register(request);
            return ResponseEntity.ok(UserDto.fromEntity(user));
        } catch (IllegalArgumentException ex) {
            // Возвращаем понятное сообщение об ошибке, чтобы фронтенд мог его показать пользователю
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<UserDto> login(@RequestParam String email,
                                         @RequestParam String password) {
        try {
            var user = userService.login(email, password);
            return ResponseEntity.ok(UserDto.fromEntity(user));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(401).body(null);
        }
    }

    @GetMapping
    public ResponseEntity<List<UserDto>> getAll() {
        var users = userService.findAll().stream().map(UserDto::fromEntity).toList();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDto> getById(@PathVariable Long id) {
        try {
            var user = userService.findById(id);
            return ResponseEntity.ok(UserDto.fromEntity(user));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserDto> updateProfile(@PathVariable Long id,
                                                 @Valid @RequestBody UpdateUserProfileRequest request) {
        try {
            var user = userService.updateProfile(id, request);
            return ResponseEntity.ok(UserDto.fromEntity(user));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.notFound().build();
        }
    }
}
