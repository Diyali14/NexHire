package com.airesumematcher.backend.ai.controller;

import com.airesumematcher.backend.ai.service.AiParserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/ai-test")
public class AiParserTestController {

    private final AiParserService aiParserService;

    public AiParserTestController(
            AiParserService aiParserService
    ) {
        this.aiParserService = aiParserService;
    }

    @PostMapping(
            value = "/parse-resume",
            consumes = "multipart/form-data"
    )
    public ResponseEntity<String> parseResume(
            @RequestParam("file") MultipartFile file
    ) throws Exception {

        byte[] pdfBytes = file.getBytes();

        String result =
                aiParserService.parseResume(
                        pdfBytes,
                        file.getOriginalFilename()
                );

        return ResponseEntity.ok(result);
    }
}