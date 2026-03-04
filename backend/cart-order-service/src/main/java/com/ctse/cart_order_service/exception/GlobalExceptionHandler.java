package com.ctse.cart_order_service.exception;

import com.ctse.cart_order_service.dto.response.ApiResponse;
import com.fasterxml.jackson.databind.exc.InvalidFormatException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

/**
 * Centralised exception handler for the Cart & Order Service.
 *
 * <p>Every controller in the application delegates error handling here via
 * Spring's {@code @RestControllerAdvice} mechanism. This keeps controllers
 * clean and ensures a consistent JSON error envelope ({@link ApiResponse}) is
 * returned to callers regardless of which layer threw the exception.
 *
 * <p>HTTP status mapping:
 * <ul>
 *   <li>404 – resource not found (cart, order, product)</li>
 *   <li>400 – business-rule violation or invalid request payload / field values</li>
 *   <li>403 – authenticated user lacks the required role</li>
 *   <li>500 – any unhandled/unexpected runtime error</li>
 * </ul>
 *
 * <p>All handlers emit a structured log line so that errors are traceable in
 * CloudWatch / Loki / any log aggregation tool without needing to inspect the
 * HTTP response.
 */
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    /**
     * Handles {@link ResourceNotFoundException} – thrown when a requested cart or
     * order document cannot be found in MongoDB.
     *
     * <p>Examples that trigger this:
     * <ul>
     *   <li>Calling {@code GET /api/orders/{id}} with a non-existent ID</li>
     *   <li>Attempting to update/remove a cart item for a user who has no cart yet</li>
     * </ul>
     *
     * @param ex exception carrying the human-readable "not found" message
     * @return 404 response with the exception message in the error body
     */
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleResourceNotFound(ResourceNotFoundException ex) {
        log.debug("[404 NOT_FOUND] {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(ex.getMessage()));
    }

    /**
     * Handles {@link CartException} – thrown for cart/order business-rule
     * violations that are the caller's fault (i.e. a 4xx, not a 5xx).
     *
     * <p>Examples that trigger this:
     * <ul>
     *   <li>Creating an order from an empty cart</li>
     *   <li>Trying to cancel an order that is already SHIPPED or DELIVERED</li>
     *   <li>Attempting to cancel another user's order</li>
     *   <li>Adding a product that is marked inactive by the Product Catalog Service</li>
     * </ul>
     *
     * @param ex exception carrying the business-rule violation message
     * @return 400 response with the violation message in the error body
     */
    @ExceptionHandler(CartException.class)
    public ResponseEntity<ApiResponse<Void>> handleCartException(CartException ex) {
        log.debug("[400 BAD_REQUEST] CartException: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(ex.getMessage()));
    }

    /**
     * Handles Bean Validation failures raised by {@code @Valid} on request bodies.
     *
     * <p>Spring triggers this when a {@code @RequestBody} fails JSR-380 constraints
     * such as {@code @NotBlank}, {@code @Min}, {@code @DecimalMin}, etc.
     * All field-level errors are collected into a map so the client knows exactly
     * which fields need to be corrected.
     *
     * <p>Example response body:
     * <pre>{@code
     * {
     *   "success": false,
     *   "message": "Validation failed",
     *   "data": {
     *     "productId": "Product ID is required",
     *     "quantity":  "Quantity must be at least 1"
     *   }
     * }
     * }</pre>
     *
     * @param ex Spring's validation exception containing all field errors
     * @return 400 response with a map of { fieldName → errorMessage }
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>> handleValidationErrors(
            MethodArgumentNotValidException ex) {

        // Collect every field error into a simple map for a clear client response
        Map<String, String> errors = new HashMap<>();
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            errors.put(error.getField(), error.getDefaultMessage());
        }

        log.debug("[400 BAD_REQUEST] Validation failed on {} field(s): {}", errors.size(), errors);

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.<Map<String, String>>builder()
                        .success(false)
                        .message("Validation failed")
                        .data(errors)
                        .build());
    }

    /**
     * Handles malformed or unreadable JSON request bodies.
     *
     * <p>The most common case is passing an invalid enum value – e.g. sending
     * {@code "status": "PROCESSING"} when only {@link com.ctse.cart_order_service.model.OrderStatus}
     * values are accepted. The handler detects this case and includes the list of
     * valid enum constants in the error message for easier debugging.
     *
     * <p>Also catches completely unparseable JSON (missing closing brace, wrong
     * types, etc.).
     *
     * @param ex Spring's wrapper around the underlying Jackson parsing error
     * @return 400 response with a descriptive message; enum errors include accepted values
     */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiResponse<Void>> handleHttpMessageNotReadable(
            HttpMessageNotReadableException ex) {

        String message = "Invalid request body";

        // Special-case: caller passed an unknown value for an enum field
        if (ex.getCause() instanceof InvalidFormatException invalidFormat
                && invalidFormat.getTargetType() != null
                && invalidFormat.getTargetType().isEnum()) {

            String accepted = Arrays.toString(invalidFormat.getTargetType().getEnumConstants());
            message = "Invalid value '" + invalidFormat.getValue()
                    + "'. Accepted values: " + accepted;

            log.debug("[400 BAD_REQUEST] Invalid enum value '{}' for type {}, accepted: {}",
                    invalidFormat.getValue(),
                    invalidFormat.getTargetType().getSimpleName(),
                    accepted);
        } else {
            log.debug("[400 BAD_REQUEST] Unreadable HTTP message: {}", ex.getMessage());
        }

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(message));
    }

    /**
     * Handles Spring Security's {@link AccessDeniedException} – thrown when an
     * authenticated user attempts an operation that requires a role they do not hold.
     *
     * <p>Examples that trigger this:
     * <ul>
     *   <li>A CUSTOMER calling {@code GET /api/orders} (admin-only)</li>
     *   <li>A CUSTOMER calling {@code PUT /api/orders/{id}/status} (admin-only)</li>
     * </ul>
     *
     * <p>Note: unauthenticated requests (no/invalid JWT) are handled separately by
     * the authentication entry-point in {@link com.ctse.cart_order_service.config.SecurityConfig}
     * and never reach this handler.
     *
     * @param ex Spring Security's access-denied exception
     * @return 403 response with a generic "access denied" message
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Void>> handleAccessDenied(AccessDeniedException ex) {
        // Log at WARN – repeated 403s may indicate a misconfigured client or a probe
        log.warn("[403 FORBIDDEN] Access denied: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.error("Access denied: " + ex.getMessage()));
    }

    /**
     * Catch-all handler for any exception not covered by the more specific handlers
     * above (e.g. unexpected NullPointerException, database connectivity issues,
     * downstream service timeouts that weren't caught locally, etc.).
     *
     * <p>The full stack trace is logged at ERROR level so it is captured by the
     * log aggregation pipeline. The response deliberately hides internal details
     * from the caller to avoid leaking implementation information.
     *
     * @param ex any unhandled runtime or checked exception
     * @return 500 response with a generic error message (no internal details exposed)
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGenericException(Exception ex) {
        // Full stack trace is intentional here – this is truly unexpected
        log.error("[500 INTERNAL_SERVER_ERROR] Unhandled exception of type {}: {}",
                ex.getClass().getSimpleName(), ex.getMessage(), ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("An unexpected error occurred"));
    }
}
