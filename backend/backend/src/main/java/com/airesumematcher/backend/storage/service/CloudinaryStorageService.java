package com.airesumematcher.backend.storage.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class CloudinaryStorageService {

    private final Cloudinary cloudinary;

    public CloudinaryStorageService(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    /**
     * Upload final PDF to Cloudinary.
     */
    public Map<String, Object> uploadPdf(
            byte[] pdfBytes,
            String publicId
    ) {

        if (pdfBytes == null || pdfBytes.length == 0) {

            throw new RuntimeException(
                    "PDF file is empty"
            );
        }

        if (publicId == null || publicId.isBlank()) {

            throw new RuntimeException(
                    "Public ID is required"
            );
        }

        try {

            @SuppressWarnings("unchecked")
            Map<String, Object> result =
                    cloudinary.uploader().upload(
                            pdfBytes,
                            ObjectUtils.asMap(
                                    "resource_type", "image",
                                    "public_id", publicId,
                                    "format", "pdf",
                                    "overwrite", false
                            )
                    );

            if (!result.containsKey("secure_url")
                    || !result.containsKey("public_id")) {

                throw new RuntimeException(
                        "Invalid response from Cloudinary"
                );
            }

            return result;

        } catch (Exception e) {

            throw new RuntimeException(
                    "PDF upload to Cloudinary failed: "
                            + e.getMessage(),
                    e
            );
        }
    }

    /**
     * Delete PDF from Cloudinary.
     */
    public void deletePdf(String publicId) {

        if (publicId == null || publicId.isBlank()) {
            return;
        }

        try {

            cloudinary.uploader().destroy(
                    publicId,
                    ObjectUtils.asMap(
                            "resource_type", "image"
                    )
            );

        } catch (Exception e) {

            throw new RuntimeException(
                    "PDF deletion from Cloudinary failed: "
                            + e.getMessage(),
                    e
            );
        }
    }
}