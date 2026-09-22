package com.airesumematcher.backend.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PasswordChangeRequest {

    @NotBlank
    private String currentPassword;

    @NotBlank
    @Size(min = 8, max = 100)
    private String newPassword;
}
