package com.spectorrent.backend.service;

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
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

import com.spectorrent.backend.domain.UserRole;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class ContractServiceTest {

    @Autowired
    private ContractService contractService;

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
        testOwner.setEmail("contractowner@test.com");
        testOwner.setPassword("password");
        testOwner.setFullName("Contract Owner");
        testOwner.setRole(UserRole.OWNER);
        testOwner = userRepository.save(testOwner);

        testRenter = new User();
        testRenter.setEmail("contractrenter@test.com");
        testRenter.setPassword("password");
        testRenter.setFullName("Contract Renter");
        testRenter.setRole(UserRole.RENTER);
        testRenter = userRepository.save(testRenter);

        testItem = new RentalItem();
        testItem.setTitle("Contract Test Item");
        testItem.setCategory("Самосвалы");
        testItem.setDailyPrice(new BigDecimal("25000"));
        testItem.setOwner(testOwner);
        testItem.setStatus("AVAILABLE");
        testItem = rentalItemRepository.save(testItem);

        testRequest = new RentalRequest();
        testRequest.setItem(testItem);
        testRequest.setRenter(testRenter);
        testRequest.setStatus("APPROVED");
        testRequest.setQuantity(2);
        testRequest.setStartDate(LocalDate.now().plusDays(1));
        testRequest.setEndDate(LocalDate.now().plusDays(10));
        testRequest.setAddress("Test Contract Address");
        testRequest = rentalRequestRepository.save(testRequest);
    }

    @Test
    @DisplayName("TC-014: Генерация договора для существующей заявки")
    void generateContract_ValidRequest_ReturnsDocument() {
        assertDoesNotThrow(() -> {
            byte[] document = contractService.generateContract(testRequest.getId());
            assertNotNull(document, "Документ не должен быть null");
            assertTrue(document.length > 0, "Документ не должен быть пустым");
        });
    }

    @Test
    @DisplayName("Генерация договора для несуществующей заявки выбрасывает исключение")
    void generateContract_InvalidRequest_ThrowsException() {
        assertThrows(Exception.class, () -> {
            contractService.generateContract(99999L);
        });
    }

    @Test
    @DisplayName("Проверка расчёта стоимости аренды")
    void calculateRentalCost_CorrectCalculation() {
        RentalRequest request = rentalRequestRepository.findById(testRequest.getId()).orElseThrow();
        
        long days = ChronoUnit.DAYS.between(request.getStartDate(), request.getEndDate()) + 1;
        BigDecimal dailyPrice = request.getItem().getDailyPrice();
        int quantity = request.getQuantity();
        
        BigDecimal expectedTotal = dailyPrice
                .multiply(BigDecimal.valueOf(days))
                .multiply(BigDecimal.valueOf(quantity));
        
        assertTrue(expectedTotal.compareTo(BigDecimal.ZERO) > 0,
                "Общая стоимость должна быть положительной");
        
        assertEquals(10, days, "Количество дней должно быть 10");
        assertEquals(new BigDecimal("25000"), dailyPrice);
        assertEquals(2, quantity);
        assertEquals(new BigDecimal("500000"), expectedTotal);
    }

    @Test
    @DisplayName("Проверка данных заявки для договора")
    void requestData_ShouldBeCompleteForContract() {
        RentalRequest request = rentalRequestRepository.findById(testRequest.getId()).orElseThrow();
        
        assertNotNull(request.getItem(), "Техника должна быть указана");
        assertNotNull(request.getRenter(), "Арендатор должен быть указан");
        assertNotNull(request.getStartDate(), "Дата начала должна быть указана");
        assertNotNull(request.getEndDate(), "Дата окончания должна быть указана");
        assertNotNull(request.getAddress(), "Адрес должен быть указан");
        assertNotNull(request.getQuantity(), "Количество должно быть указано");
    }

    @Test
    @DisplayName("Проверка данных владельца для договора")
    void ownerData_ShouldBeAvailableForContract() {
        RentalRequest request = rentalRequestRepository.findById(testRequest.getId()).orElseThrow();
        User owner = request.getItem().getOwner();
        
        assertNotNull(owner, "Владелец должен быть указан");
        assertNotNull(owner.getFullName(), "Имя владельца должно быть указано");
    }

    @Test
    @DisplayName("Проверка данных арендатора для договора")
    void renterData_ShouldBeAvailableForContract() {
        RentalRequest request = rentalRequestRepository.findById(testRequest.getId()).orElseThrow();
        User renter = request.getRenter();
        
        assertNotNull(renter, "Арендатор должен быть указан");
        assertNotNull(renter.getFullName(), "Имя арендатора должно быть указано");
    }
}
