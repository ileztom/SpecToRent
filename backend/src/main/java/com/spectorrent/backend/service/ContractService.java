package com.spectorrent.backend.service;

import com.spectorrent.backend.domain.ContractCounter;
import com.spectorrent.backend.domain.RentalRequest;
import com.spectorrent.backend.domain.User;
import com.spectorrent.backend.domain.RentalItem;
import com.spectorrent.backend.repository.ContractCounterRepository;
import com.spectorrent.backend.repository.RentalRequestRepository;
import lombok.RequiredArgsConstructor;
import org.apache.poi.xwpf.usermodel.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class ContractService {
    
    private final ContractCounterRepository counterRepository;
    private final RentalRequestRepository requestRepository;
    
    @Transactional
    public synchronized Long getNextContractNumber() {
        ContractCounter counter = counterRepository.findById(1L)
            .orElseGet(() -> {
                ContractCounter newCounter = ContractCounter.builder()
                    .id(1L)
                    .lastNumber(0L)
                    .build();
                return counterRepository.save(newCounter);
            });
        
        counter.setLastNumber(counter.getLastNumber() + 1);
        counterRepository.save(counter);
        return counter.getLastNumber();
    }
    
    public byte[] generateContract(Long requestId) throws IOException {
        RentalRequest request = requestRepository.findById(requestId)
            .orElseThrow(() -> new RuntimeException("Request not found"));
        
        User renter = request.getRenter();
        RentalItem item = request.getItem();
        User owner = item.getOwner();
        
        Long contractNumber = getNextContractNumber();
        
        try (XWPFDocument document = new XWPFDocument()) {
            // Title
            XWPFParagraph titlePara = document.createParagraph();
            titlePara.setAlignment(ParagraphAlignment.CENTER);
            XWPFRun titleRun = titlePara.createRun();
            titleRun.setBold(true);
            titleRun.setFontSize(14);
            titleRun.setText("Договор № " + contractNumber);
            titleRun.addBreak();
            
            XWPFRun subtitleRun = titlePara.createRun();
            subtitleRun.setFontSize(12);
            subtitleRun.setText("на оказание услуг транспортными средствами,");
            subtitleRun.addBreak();
            subtitleRun.setText("строительной и другой специализированной техникой");
            
            // Date and city
            XWPFParagraph datePara = document.createParagraph();
            XWPFRun dateRun = datePara.createRun();
            dateRun.addBreak();
            
            String city = renter.getRegion() != null ? renter.getRegion() : "Москва";
            LocalDate now = LocalDate.now();
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("d MMMM yyyy", new Locale("ru"));
            String dateStr = now.format(formatter);
            
            dateRun.setText("г. " + city + "                                                                     " + dateStr);
            dateRun.addBreak();
            dateRun.addBreak();
            
            // Parties
            XWPFParagraph partiesPara = document.createParagraph();
            XWPFRun partiesRun = partiesPara.createRun();
            
            String renterName = renter.getFullName() != null ? renter.getFullName() : "Арендатор";
            String ownerName = owner.getFullName() != null ? owner.getFullName() : "Владелец";
            
            partiesRun.setText(renterName + ", именуемое в дальнейшем «Заказчик», в лице Генерального директора, действующего на основании Устава с одной стороны и " + ownerName + ", именуемое в дальнейшем «Исполнитель», в лице исполнителя " + ownerName + ", действующего на основании Устава с другой стороны, с соблюдением требований Гражданского кодекса РФ, заключили настоящий Договор о нижеследующем:");
            partiesRun.addBreak();
            partiesRun.addBreak();
            
            // Subject header
            XWPFParagraph subjectHeaderPara = document.createParagraph();
            subjectHeaderPara.setAlignment(ParagraphAlignment.CENTER);
            XWPFRun subjectHeaderRun = subjectHeaderPara.createRun();
            subjectHeaderRun.setBold(true);
            subjectHeaderRun.setText("1. Предмет договора");
            
            // Subject content
            XWPFParagraph subjectPara = document.createParagraph();
            XWPFRun subjectRun = subjectPara.createRun();
            subjectRun.addBreak();
            subjectRun.setText("1.1. В соответствии с условиями настоящего Договора Исполнитель оказывает Заказчику услуги по предоставлению транспортных средств, строительной и другой специализированной техники (далее – «Техника») с обслуживающим ее персоналом для выполнения строительно-монтажных и погрузочно-разгрузочных работ на объектах Заказчика, а Заказчик обязуется оплатить оказанные услуги Исполнителя в соответствии с условиями настоящего договора.");
            subjectRun.addBreak();
            subjectRun.addBreak();
            
            // Order details
            XWPFParagraph detailsHeaderPara = document.createParagraph();
            detailsHeaderPara.setAlignment(ParagraphAlignment.CENTER);
            XWPFRun detailsHeaderRun = detailsHeaderPara.createRun();
            detailsHeaderRun.setBold(true);
            detailsHeaderRun.setText("Данные заказа");
            
            XWPFParagraph detailsPara = document.createParagraph();
            XWPFRun detailsRun = detailsPara.createRun();
            detailsRun.addBreak();
            
            String itemTitle = item.getTitle() != null ? item.getTitle() : "Техника";
            Integer quantity = request.getQuantity() != null ? request.getQuantity() : 1;
            String address = request.getAddress() != null ? request.getAddress() : "Не указан";
            BigDecimal dailyPrice = item.getDailyPrice() != null ? item.getDailyPrice() : BigDecimal.ZERO;
            
            // Calculate days
            long days = 1;
            if (request.getStartDate() != null && request.getEndDate() != null) {
                days = java.time.temporal.ChronoUnit.DAYS.between(request.getStartDate(), request.getEndDate()) + 1;
            }
            BigDecimal totalPrice = dailyPrice.multiply(BigDecimal.valueOf(quantity)).multiply(BigDecimal.valueOf(days));
            
            detailsRun.setText("Наименование техники: " + itemTitle);
            detailsRun.addBreak();
            detailsRun.setText("Количество: " + quantity + " ед.");
            detailsRun.addBreak();
            detailsRun.setText("Период аренды: " + request.getStartDate() + " - " + request.getEndDate());
            detailsRun.addBreak();
            detailsRun.setText("Адрес доставки: " + address);
            detailsRun.addBreak();
            detailsRun.setText("Стоимость смены: " + String.format("%.2f", dailyPrice.doubleValue()) + " руб.");
            detailsRun.addBreak();
            detailsRun.setText("Итого: " + String.format("%.2f", totalPrice.doubleValue()) + " руб.");
            detailsRun.addBreak();
            detailsRun.addBreak();
            
            // Contact info
            XWPFParagraph contactHeaderPara = document.createParagraph();
            contactHeaderPara.setAlignment(ParagraphAlignment.CENTER);
            XWPFRun contactHeaderRun = contactHeaderPara.createRun();
            contactHeaderRun.setBold(true);
            contactHeaderRun.setText("Контактные данные сторон");
            
            XWPFParagraph contactPara = document.createParagraph();
            XWPFRun contactRun = contactPara.createRun();
            contactRun.addBreak();
            
            String renterPhone = renter.getPhone() != null ? renter.getPhone() : "Не указан";
            String renterEmail = renter.getEmail() != null ? renter.getEmail() : "Не указан";
            String ownerPhone = owner.getPhone() != null ? owner.getPhone() : "Не указан";
            String ownerEmail = owner.getEmail() != null ? owner.getEmail() : "Не указан";
            
            contactRun.setText("Заказчик:");
            contactRun.addBreak();
            contactRun.setText("  ФИО: " + renterName);
            contactRun.addBreak();
            contactRun.setText("  Телефон: " + renterPhone);
            contactRun.addBreak();
            contactRun.setText("  Email: " + renterEmail);
            contactRun.addBreak();
            contactRun.addBreak();
            contactRun.setText("Исполнитель:");
            contactRun.addBreak();
            contactRun.setText("  ФИО: " + ownerName);
            contactRun.addBreak();
            contactRun.setText("  Телефон: " + ownerPhone);
            contactRun.addBreak();
            contactRun.setText("  Email: " + ownerEmail);
            contactRun.addBreak();
            contactRun.addBreak();
            
            // Signatures
            XWPFParagraph sigPara = document.createParagraph();
            XWPFRun sigRun = sigPara.createRun();
            sigRun.addBreak();
            sigRun.addBreak();
            sigRun.setText("Подписи сторон:");
            sigRun.addBreak();
            sigRun.addBreak();
            sigRun.setText("Заказчик: _____________________       Исполнитель: _____________________");
            sigRun.addBreak();
            sigRun.setText("                " + renterName + "                                          " + ownerName);
            
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            document.write(out);
            return out.toByteArray();
        }
    }
}
