package com.airesumematcher.backend.storage.controller;

import com.airesumematcher.backend.storage.service.FileProcessingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/storage-test")
public class CloudinaryTestController {

    private final FileProcessingService fileProcessingService;

    public CloudinaryTestController(
            FileProcessingService fileProcessingService
    ) {
        this.fileProcessingService =
                fileProcessingService;
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(
            @RequestParam("file") MultipartFile file
    ) {

        String publicId =
                "nexhire/test/"
                        + System.currentTimeMillis()
                        + "/resume";

        Map<String, Object> result =
                fileProcessingService.processAndUpload(
                        file,
                        publicId
                );

        return ResponseEntity.ok(result);
    }


}