package com.airesumematcher.backend.storage.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Locale;
import java.util.Map;

@Service
public class FileProcessingService {

    private final DocumentConversionService documentConversionService;
    private final CloudinaryStorageService cloudinaryStorageService;

    public FileProcessingService(DocumentConversionService documentConversionService, CloudinaryStorageService cloudinaryStorageService) {
        this.documentConversionService = documentConversionService;

        this.cloudinaryStorageService = cloudinaryStorageService;
    }

    public Map<String, Object> processAndUpload(MultipartFile file, String publicId) {

        validateFile(file);

        String extension = getExtension(file.getOriginalFilename());

        byte[] pdfBytes;
        String originalFileType;

        switch (extension) {

            case "pdf" -> {

                try {

                    pdfBytes = file.getBytes();

                } catch (Exception e) {

                    throw new RuntimeException("Unable to read PDF file", e);
                }

                originalFileType = "PDF";
            }

            case "docx" -> {

                pdfBytes = documentConversionService.convertDocxToPdf(file);

                originalFileType = "DOCX";
            }

            case "txt" -> {

                pdfBytes = documentConversionService.convertTxtToPdf(file);
                originalFileType = "TXT";
            }

            default -> throw new RuntimeException("Unsupported file type. " + "Only PDF, DOCX and TXT are allowed.");
        }

        Map<String, Object> uploadResult =
                cloudinaryStorageService.uploadPdf(pdfBytes, publicId);

        return Map.of(
                "message",
                "File processed and uploaded successfully",

                "originalFileName",
                file.getOriginalFilename(),

                "originalFileType",
                originalFileType,

                "storedFileType",
                "PDF",

                "storedFileSize",
                pdfBytes.length,

                "publicId",
                uploadResult.get("public_id"),

                "secureUrl",
                uploadResult.get("secure_url"),

                "resourceType",
                uploadResult.get("resource_type"),

                "format",
                uploadResult.get("format"),

                "bytes",
                uploadResult.get("bytes"));
    }

    private void validateFile(MultipartFile file) {

        if (file == null || file.isEmpty()) {

            throw new RuntimeException("File is empty");
        }

        String extension = getExtension(file.getOriginalFilename());
        if (!extension.equals("pdf") && !extension.equals("docx") && !extension.equals("txt")) {

            throw new RuntimeException("Unsupported file type. " + "Only PDF, DOCX and TXT are allowed.");
        }
    }

    private String getExtension(String fileName) {

        if (fileName == null || !fileName.contains(".")) {

            return "";
        }

        return fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase(Locale.ROOT);
    }
}