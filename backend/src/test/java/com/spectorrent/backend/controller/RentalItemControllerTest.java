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

import com.spectorrent.backend.domain.UserRole;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class RentalItemControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private RentalItemRepository rentalItemRepository;

    @Autowired
    private RentalRequestRepository rentalRequestRepository;

    @Autowired
    private UserRepository userRepository;

    private User testOwner;
    private User testRenter;
    private RentalItem testItem;

    @BeforeEach
    void setUp() {
        testOwner = new User();
        testOwner.setEmail("testowner@test.com");
        testOwner.setPassword("password");
        testOwner.setFullName("Test Owner");
        testOwner.setRole(UserRole.OWNER);
        testOwner = userRepository.save(testOwner);

        testRenter = new User();
        testRenter.setEmail("testrenter@test.com");
        testRenter.setPassword("password");
        testRenter.setFullName("Test Renter");
        testRenter.setRole(UserRole.RENTER);
        testRenter = userRepository.save(testRenter);

        testItem = new RentalItem();
        testItem.setTitle("Test Excavator");
        testItem.setCategory("Экскаваторы");
        testItem.setRegion("Москва");
        testItem.setDailyPrice(new BigDecimal("15000"));
        testItem.setAvailableCount(2);
        testItem.setOwner(testOwner);
        testItem.setStatus("AVAILABLE");
        testItem = rentalItemRepository.save(testItem);
    }

    @Test
    @DisplayName("TC-007: Получение списка всех объявлений")
    void getAllItems_ReturnsListOfItems() throws Exception {
        mockMvc.perform(get("/api/items"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].id").value(testItem.getId()))
                .andExpect(jsonPath("$[0].title").value("Test Excavator"))
                .andExpect(jsonPath("$[0].category").value("Экскаваторы"));
    }

    @Test
    @DisplayName("TC-008: Получение объявления по ID")
    void getItemById_WhenExists_ReturnsItem() throws Exception {
        mockMvc.perform(get("/api/items/" + testItem.getId()))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id").value(testItem.getId()))
                .andExpect(jsonPath("$.title").value("Test Excavator"));
    }

    @Test
    @DisplayName("Получение несуществующего объявления возвращает 404")
    void getItemById_WhenNotExists_Returns404() throws Exception {
        mockMvc.perform(get("/api/items/99999"))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("TC-016: Удаление объявления без активных заявок успешно")
    void deleteItem_WithoutActiveRequests_ReturnsNoContent() throws Exception {
        RentalItem itemToDelete = new RentalItem();
        itemToDelete.setTitle("Item To Delete");
        itemToDelete.setOwner(testOwner);
        itemToDelete.setDailyPrice(new BigDecimal("10000"));
        itemToDelete.setStatus("AVAILABLE");
        itemToDelete = rentalItemRepository.save(itemToDelete);

        mockMvc.perform(delete("/api/items/" + itemToDelete.getId()))
                .andExpect(status().isNoContent());

        assertFalse(rentalItemRepository.existsById(itemToDelete.getId()));
    }

    @Test
    @DisplayName("TC-017: Удаление объявления с активными заявками невозможно")
    void deleteItem_WithActiveRequests_ReturnsBadRequest() throws Exception {
        RentalRequest activeRequest = new RentalRequest();
        activeRequest.setItem(testItem);
        activeRequest.setRenter(testRenter);
        activeRequest.setStatus("NEW");
        activeRequest.setQuantity(1);
        rentalRequestRepository.save(activeRequest);

        mockMvc.perform(delete("/api/items/" + testItem.getId()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").exists());
    }

    @Test
    @DisplayName("Удаление объявления с неактивными заявками успешно")
    void deleteItem_WithInactiveRequests_ReturnsNoContent() throws Exception {
        RentalRequest rejectedRequest = new RentalRequest();
        rejectedRequest.setItem(testItem);
        rejectedRequest.setRenter(testRenter);
        rejectedRequest.setStatus("REJECTED");
        rejectedRequest.setQuantity(1);
        rentalRequestRepository.save(rejectedRequest);

        mockMvc.perform(delete("/api/items/" + testItem.getId()))
                .andExpect(status().isNoContent());

        assertFalse(rentalItemRepository.existsById(testItem.getId()));
    }

    @Test
    @DisplayName("Проверка цены объявления - положительное значение")
    void itemPrice_ShouldBePositive() {
        RentalItem item = rentalItemRepository.findById(testItem.getId()).orElseThrow();
        assertNotNull(item.getDailyPrice());
        assertTrue(item.getDailyPrice().compareTo(BigDecimal.ZERO) > 0,
                "Цена должна быть положительной");
    }

    @Test
    @DisplayName("Проверка связи объявления с владельцем")
    void item_ShouldHaveOwner() {
        RentalItem item = rentalItemRepository.findById(testItem.getId()).orElseThrow();
        assertNotNull(item.getOwner());
        assertEquals(testOwner.getId(), item.getOwner().getId());
    }
}
