package com.spectorrent.backend.controller;

import com.spectorrent.backend.service.ContractService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/contracts")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ContractController {
    
    private final ContractService contractService;
    
    @GetMapping("/{requestId}/download")
    public ResponseEntity<byte[]> downloadContract(@PathVariable Long requestId) {
        try {
            byte[] document = contractService.generateContract(requestId);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.valueOf("application/vnd.openxmlformats-officedocument.wordprocessingml.document"));
            headers.setContentDispositionFormData("attachment", "contract_" + requestId + ".docx");
            headers.setContentLength(document.length);
            
            return ResponseEntity.ok()
                .headers(headers)
                .body(document);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
