package com.airesumematcher.backend.storage.service;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;

import org.docx4j.Docx4J;
import org.docx4j.convert.out.FOSettings;
import org.docx4j.openpackaging.packages.WordprocessingMLPackage;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

@Service
public class DocumentConversionService {

    /**
     * DOCX -> PDF
     */
    public byte[] convertDocxToPdf(MultipartFile file) {

        try (
                InputStream inputStream = file.getInputStream();
                ByteArrayOutputStream outputStream =
                        new ByteArrayOutputStream()
        ) {

            WordprocessingMLPackage wordMLPackage =
                    WordprocessingMLPackage.load(inputStream);

            FOSettings foSettings =
                    Docx4J.createFOSettings();

            foSettings.setWmlPackage(wordMLPackage);

            Docx4J.toFO(
                    foSettings,
                    outputStream,
                    Docx4J.FLAG_EXPORT_PREFER_XSL
            );

            return outputStream.toByteArray();

        } catch (Exception e) {

            throw new RuntimeException(
                    "DOCX to PDF conversion failed: "
                            + e.getMessage(),
                    e
            );
        }
    }

    /**
     * TXT -> PDF
     */
    public byte[] convertTxtToPdf(MultipartFile file) {

        try {

            String text = new String(
                    file.getBytes(),
                    StandardCharsets.UTF_8
            );

            try (
                    ByteArrayOutputStream outputStream =
                            new ByteArrayOutputStream();

                    PDDocument document =
                            new PDDocument()
            ) {

                PDType1Font font =
                        new PDType1Font(
                                Standard14Fonts.FontName.HELVETICA
                        );

                float fontSize = 10;
                float leading = 14;
                float margin = 50;
                float bottomMargin = 50;

                PDPage page =
                        new PDPage(PDRectangle.A4);

                document.addPage(page);

                PDPageContentStream contentStream =
                        new PDPageContentStream(
                                document,
                                page
                        );

                contentStream.beginText();
                contentStream.setFont(
                        font,
                        fontSize
                );

                float y =
                        PDRectangle.A4.getHeight()
                                - margin;

                contentStream.newLineAtOffset(
                        margin,
                        y
                );

                for (String line : text.split("\\R", -1)) {

                    String remaining = line;

                    if (remaining.isEmpty()) {

                        contentStream.newLineAtOffset(
                                0,
                                -leading
                        );

                        y -= leading;

                    } else {

                        while (!remaining.isEmpty()) {

                            String lineToWrite =
                                    fitLine(
                                            remaining,
                                            font,
                                            fontSize,
                                            PDRectangle.A4.getWidth()
                                                    - (2 * margin)
                                    );

                            contentStream.showText(
                                    sanitizeText(lineToWrite)
                            );

                            remaining =
                                    remaining.substring(
                                            lineToWrite.length()
                                    );

                            if (!remaining.isEmpty()) {
                                remaining =
                                        remaining.stripLeading();
                            }

                            y -= leading;

                            if (y <= bottomMargin) {

                                contentStream.endText();
                                contentStream.close();

                                page =
                                        new PDPage(
                                                PDRectangle.A4
                                        );

                                document.addPage(page);

                                contentStream =
                                        new PDPageContentStream(
                                                document,
                                                page
                                        );

                                contentStream.beginText();

                                contentStream.setFont(
                                        font,
                                        fontSize
                                );

                                y =
                                        PDRectangle.A4.getHeight()
                                                - margin;

                                contentStream.newLineAtOffset(
                                        margin,
                                        y
                                );
                            }
                        }
                    }
                }

                contentStream.endText();
                contentStream.close();

                document.save(outputStream);

                return outputStream.toByteArray();
            }

        } catch (Exception e) {

            throw new RuntimeException(
                    "TXT to PDF conversion failed: "
                            + e.getMessage(),
                    e
            );
        }
    }

    private String fitLine(
            String text,
            PDType1Font font,
            float fontSize,
            float maxWidth
    ) throws IOException {

        if (text.isEmpty()) {
            return "";
        }

        int end = text.length();

        while (end > 1) {

            String candidate =
                    text.substring(0, end);

            float width =
                    font.getStringWidth(candidate)
                            / 1000
                            * fontSize;

            if (width <= maxWidth) {
                return candidate;
            }

            end--;
        }

        return text.substring(0, 1);
    }

    private String sanitizeText(String text) {

        return text
                .replace("\t", "    ")
                .replace("\u0000", "");
    }
}