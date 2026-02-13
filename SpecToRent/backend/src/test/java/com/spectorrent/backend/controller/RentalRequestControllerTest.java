package com.spectorrent.backend.controller;

import com.spectorrent.backend.domain.RentalItem;
import com.spectorrent.backend.domain.RentalRequest;
import com.spectorrent.backend.domain.User;
import com.spectorrent.backend.repository.RentalItemRepository;
import com.spectorrent.backend.repository.RentalRequestRepository;
import com.spectorrent.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import com.spectorrent.backend.domain.UserRole;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class RentalRequestControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private RentalRequestRepository rentalRequestRepository;

    @Autowired
    private RentalItemRepository rentalItemRepository;

    @Autowired
    private UserRepository userRepository;

    private User testOwner;
    private User testRenter;
    private RentalItem testItem;
    private RentalRequest testRequest;

    @BeforeEach
    void setUp() {
        testOwner = new User();
        testOwner.setEmail("owner@test.com");
        testOwner.setPassword("password");
        testOwner.setFullName("Test Owner");
        testOwner.setRole(UserRole.OWNER);
        testOwner = userRepository.save(testOwner);

        testRenter = new User();
        testRenter.setEmail("renter@test.com");
        testRenter.setPassword("password");
        testRenter.setFullName("Test Renter");
        testRenter.setRole(UserRole.RENTER);
        testRenter = userRepository.save(testRenter);

        testItem = new RentalItem();
        testItem.setTitle("Test Crane");
        testItem.setCategory("Автокраны");
        testItem.setDailyPrice(new BigDecimal("20000"));
        testItem.setOwner(testOwner);
        testItem.setStatus("AVAILABLE");
        testItem = rentalItemRepository.save(testItem);

        testRequest = new RentalRequest();
        testRequest.setItem(testItem);
        testRequest.setRenter(testRenter);
        testRequest.setStatus("NEW");
        testRequest.setQuantity(1);
        testRequest.setStartDate(LocalDate.now().plusDays(1));
        testRequest.setEndDate(LocalDate.now().plusDays(5));
        testRequest.setAddress("Test Address");
        testRequest = rentalRequestRepository.save(testRequest);
    }

    @Test
    @DisplayName("Получение списка всех заявок")
    void getAllRequests_ReturnsListOfRequests() throws Exception {
        mockMvc.perform(get("/api/requests"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].id").value(testRequest.getId()))
                .andExpect(jsonPath("$[0].status").value("NEW"))
                .andExpect(jsonPath("$[0].quantity").value(1));
    }

    @Test
    @DisplayName("TC-011: Одобрение заявки владельцем")
    void updateRequestStatus_Approve_ReturnsUpdated() throws Exception {
        mockMvc.perform(patch("/api/requests/" + testRequest.getId() + "/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"APPROVED\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("APPROVED"));

        RentalRequest updated = rentalRequestRepository.findById(testRequest.getId()).orElseThrow();
        assertEquals("APPROVED", updated.getStatus());
    }

    @Test
    @DisplayName("TC-012: Отклонение заявки владельцем")
    void updateRequestStatus_Reject_ReturnsUpdated() throws Exception {
        mockMvc.perform(patch("/api/requests/" + testRequest.getId() + "/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"REJECTED\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("REJECTED"));
    }

    @Test
    @DisplayName("TC-013: Досрочное завершение аренды")
    void updateRequestStatus_EarlyComplete_ReturnsUpdated() throws Exception {
        testRequest.setStatus("APPROVED");
        rentalRequestRepository.save(testRequest);

        mockMvc.perform(patch("/api/requests/" + testRequest.getId() + "/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"EARLY_COMPLETED\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("EARLY_COMPLETED"));
    }

    @Test
    @DisplayName("Обновление статуса несуществующей заявки возвращает 404")
    void updateRequestStatus_NonExistentRequest_Returns404() throws Exception {
        mockMvc.perform(patch("/api/requests/99999/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"APPROVED\"}"))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Обновление статуса без body возвращает 400")
    void updateRequestStatus_NoStatus_ReturnsBadRequest() throws Exception {
        mockMvc.perform(patch("/api/requests/" + testRequest.getId() + "/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Проверка допустимых статусов заявки")
    void requestStatus_ShouldBeValid() {
        List<String> validStatuses = List.of("NEW", "APPROVED", "REJECTED", "CANCELED", "COMPLETED", "EARLY_COMPLETED");
        
        RentalRequest request = rentalRequestRepository.findById(testRequest.getId()).orElseThrow();
        assertTrue(validStatuses.contains(request.getStatus()),
                "Статус '" + request.getStatus() + "' должен быть допустимым");
    }

    @Test
    @DisplayName("Проверка наличия обязательных полей заявки")
    void request_ShouldHaveRequiredFields() {
        RentalRequest request = rentalRequestRepository.findById(testRequest.getId()).orElseThrow();
        
        assertNotNull(request.getId(), "ID заявки не должен быть null");
        assertNotNull(request.getStatus(), "Статус заявки не должен быть null");
        assertNotNull(request.getItem(), "Объявление не должно быть null");
        assertNotNull(request.getRenter(), "Арендатор не должен быть null");
    }

    @Test
    @DisplayName("Проверка связи заявки с техникой и арендатором")
    void request_ShouldHaveCorrectRelations() {
        RentalRequest request = rentalRequestRepository.findById(testRequest.getId()).orElseThrow();
        
        assertEquals(testItem.getId(), request.getItem().getId());
        assertEquals(testRenter.getId(), request.getRenter().getId());
    }
}
