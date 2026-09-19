package com.airesumematcher.backend.storage.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.stereotype.Service;

import java.util.Map;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;

@Service
public class CloudinaryStorageService {

    private final Cloudinary cloudinary;

    public Map<String, Object> getResourceDetails(String publicId) {

        if (publicId == null || publicId.isBlank()) {
            throw new IllegalArgumentException(
                    "Cloudinary public ID is required"
            );
        }

        try {

            return cloudinary.api().resource(
                    publicId,
                    ObjectUtils.asMap(
                            "resource_type", "image"
                    )
            );

        } catch (Exception e) {

            throw new RuntimeException(
                    "Failed to retrieve Cloudinary resource: "
                            + e.getMessage(),
                    e
            );
        }
    }

    public byte[] downloadFile(String publicId) {

        if (publicId == null || publicId.isBlank()) {
            throw new IllegalArgumentException(
                    "Cloudinary public ID is required"
            );
        }

        try {

            String url =
                    cloudinary
                            .url()
                            .resourceType("image")
                            .format("pdf")
                            .secure(true)
                            .generate(publicId);

            HttpURLConnection connection =
                    (HttpURLConnection)
                            new URL(url).openConnection();

            connection.setRequestMethod("GET");
            connection.setConnectTimeout(10_000);
            connection.setReadTimeout(30_000);

            int responseCode =
                    connection.getResponseCode();

            if (responseCode != HttpURLConnection.HTTP_OK) {

                throw new RuntimeException(
                        "Cloudinary download failed. HTTP status: "
                                + responseCode
                );
            }

            try (InputStream inputStream =
                         connection.getInputStream();
                 ByteArrayOutputStream outputStream =
                         new ByteArrayOutputStream()) {

                byte[] buffer = new byte[8192];

                int bytesRead;

                while ((bytesRead =
                        inputStream.read(buffer)) != -1) {

                    outputStream.write(
                            buffer,
                            0,
                            bytesRead
                    );
                }

                return outputStream.toByteArray();
            }

        } catch (Exception e) {

            throw new RuntimeException(
                    "Failed to download file from Cloudinary",
                    e
            );
        }
    }

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