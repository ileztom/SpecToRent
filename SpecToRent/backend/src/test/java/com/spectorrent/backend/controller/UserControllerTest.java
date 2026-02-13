package com.spectorrent.backend.controller;

import com.spectorrent.backend.domain.User;
import com.spectorrent.backend.domain.UserRole;
import com.spectorrent.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setEmail("testuser@test.com");
        // Store BCrypt-encoded password so login() / passwordEncoder.matches() works
        testUser.setPassword(passwordEncoder.encode("password123"));
        testUser.setFullName("Test User");
        testUser.setRole(UserRole.RENTER);
        testUser = userRepository.save(testUser);
    }

    @Test
    @DisplayName("TC-002: Регистрация с существующим email возвращает ошибку")
    void register_DuplicateEmail_ReturnsBadRequest() throws Exception {
        mockMvc.perform(post("/api/users/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"testuser@test.com\",\"password\":\"newpass123\",\"fullName\":\"Another User\",\"role\":\"RENTER\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("TC-001: Регистрация нового пользователя успешна")
    void register_NewUser_ReturnsSuccess() throws Exception {
        mockMvc.perform(post("/api/users/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"newuser@test.com\",\"password\":\"password123\",\"fullName\":\"New User\",\"role\":\"OWNER\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("newuser@test.com"));
    }

    @Test
    @DisplayName("TC-003: Авторизация с корректными данными")
    void login_ValidCredentials_ReturnsUser() throws Exception {
        // Controller uses @RequestParam, so send as form params
        mockMvc.perform(post("/api/users/login")
                        .param("email", "testuser@test.com")
                        .param("password", "password123"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("testuser@test.com"));
    }

    @Test
    @DisplayName("TC-004: Авторизация с неверными данными возвращает ошибку")
    void login_InvalidCredentials_ReturnsUnauthorized() throws Exception {
        mockMvc.perform(post("/api/users/login")
                        .param("email", "testuser@test.com")
                        .param("password", "wrongpassword"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Получение пользователя по ID")
    void getUserById_WhenExists_ReturnsUser() throws Exception {
        mockMvc.perform(get("/api/users/" + testUser.getId()))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id").value(testUser.getId()))
                .andExpect(jsonPath("$.email").value("testuser@test.com"));
    }

    @Test
    @DisplayName("Получение несуществующего пользователя возвращает 404")
    void getUserById_WhenNotExists_Returns404() throws Exception {
        mockMvc.perform(get("/api/users/99999"))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("TC-018: Обновление профиля пользователя")
    void updateUser_ValidData_ReturnsUpdated() throws Exception {
        // Controller uses @PutMapping, so use put()
        mockMvc.perform(put("/api/users/" + testUser.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"fullName\":\"Updated Name\",\"phone\":\"+7999999999\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fullName").value("Updated Name"));
    }

    @Test
    @DisplayName("Проверка допустимых ролей пользователя")
    void userRole_ShouldBeValid() {
        List<String> validRoles = List.of("OWNER", "RENTER", "ADMIN");

        User user = userRepository.findById(testUser.getId()).orElseThrow();
        // user.getRole() returns UserRole enum — use .name() for String comparison
        assertTrue(validRoles.contains(user.getRole().name()),
                "Роль '" + user.getRole().name() + "' должна быть допустимой");
    }

    @Test
    @DisplayName("Проверка формата email пользователя")
    void userEmail_ShouldBeValid() {
        User user = userRepository.findById(testUser.getId()).orElseThrow();

        assertNotNull(user.getEmail());
        assertTrue(user.getEmail().contains("@"), "Email должен содержать символ @");
    }

    @Test
    @DisplayName("Проверка наличия обязательных полей пользователя")
    void user_ShouldHaveRequiredFields() {
        User user = userRepository.findById(testUser.getId()).orElseThrow();

        assertNotNull(user.getId());
        assertNotNull(user.getEmail());
        assertNotNull(user.getFullName());
        assertNotNull(user.getRole());
    }
}
