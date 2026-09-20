package com.airesumematcher.backend.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private ErrorResponse buildError(
            HttpStatus status,
            String message,
            HttpServletRequest request
    ) {
        return ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(status.value())
                .error(status.getReasonPhrase())
                .message(message)
                .path(request.getRequestURI())
                .build();
    }


    // =========================================================
    // 400 - Validation errors
    // =========================================================

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(
            MethodArgumentNotValidException ex,
            HttpServletRequest request
    ) {

        String message =
                ex.getBindingResult()
                        .getFieldErrors()
                        .stream()
                        .findFirst()
                        .map(error ->
                                error.getField()
                                        + ": "
                                        + error.getDefaultMessage()
                        )
                        .orElse("Invalid request");

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(
                        buildError(
                                HttpStatus.BAD_REQUEST,
                                message,
                                request
                        )
                );
    }


    // =========================================================
    // 400 - Illegal arguments
    // =========================================================

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgumentException(
            IllegalArgumentException ex,
            HttpServletRequest request
    ) {

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(
                        buildError(
                                HttpStatus.BAD_REQUEST,
                                ex.getMessage(),
                                request
                        )
                );
    }


    // =========================================================
    // 401 - Invalid credentials
    // =========================================================

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleBadCredentials(
            BadCredentialsException ex,
            HttpServletRequest request
    ) {

        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(
                        buildError(
                                HttpStatus.UNAUTHORIZED,
                                "Invalid credentials",
                                request
                        )
                );
    }


    // =========================================================
    // 403 - Access denied
    // =========================================================

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(
            AccessDeniedException ex,
            HttpServletRequest request
    ) {

        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(
                        buildError(
                                HttpStatus.FORBIDDEN,
                                "Access denied",
                                request
                        )
                );
    }


    // =========================================================
    // 404 - ResponseStatusException
    // =========================================================

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ErrorResponse> handleResponseStatusException(
            ResponseStatusException ex,
            HttpServletRequest request
    ) {

        HttpStatus status =
                HttpStatus.valueOf(
                        ex.getStatusCode().value()
                );

        String message =
                ex.getReason() != null
                        ? ex.getReason()
                        : status.getReasonPhrase();

        return ResponseEntity
                .status(status)
                .body(
                        buildError(
                                status,
                                message,
                                request
                        )
                );
    }


    // =========================================================
    // 404 - Resource not found
    // =========================================================

    @ExceptionHandler(
            org.springframework.web.servlet.resource.NoResourceFoundException.class
    )
    public ResponseEntity<ErrorResponse> handleNotFound(
            Exception ex,
            HttpServletRequest request
    ) {

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(
                        buildError(
                                HttpStatus.NOT_FOUND,
                                "Resource not found",
                                request
                        )
                );
    }


    // =========================================================
    // 409 - Conflict
    // =========================================================

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ErrorResponse> handleConflict(
            IllegalStateException ex,
            HttpServletRequest request
    ) {

        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(
                        buildError(
                                HttpStatus.CONFLICT,
                                ex.getMessage(),
                                request
                        )
                );
    }


    // =========================================================
    // 500 - Unexpected errors
    //
    // IMPORTANT:
    // During development we expose the actual exception message
    // so we can identify the real Apply/RabbitMQ/DB problem.
    // =========================================================

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneralException(
            Exception ex,
            HttpServletRequest request
    ) {

        ex.printStackTrace();

        String message =
                ex.getMessage() != null
                        ? ex.getMessage()
                        : ex.getClass().getSimpleName();

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(
                        buildError(
                                HttpStatus.INTERNAL_SERVER_ERROR,
                                message,
                                request
                        )
                );
    }
}