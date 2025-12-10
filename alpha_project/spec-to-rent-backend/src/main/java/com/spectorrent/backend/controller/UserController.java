package com.spectorrent.backend.controller;

import com.spectorrent.backend.dto.CreateUserRequest;
import com.spectorrent.backend.dto.UserDto;
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
    public ResponseEntity<UserDto> register(@Valid @RequestBody CreateUserRequest request) {
        var user = userService.register(request);
        return ResponseEntity.ok(UserDto.fromEntity(user));
    }

    @GetMapping
    public ResponseEntity<List<UserDto>> getAll() {
        var users = userService.findAll().stream().map(UserDto::fromEntity).toList();
        return ResponseEntity.ok(users);
    }
}
