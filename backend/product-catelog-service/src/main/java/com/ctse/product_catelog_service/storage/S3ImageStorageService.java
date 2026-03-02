package com.ctse.product_catelog_service.storage;

import com.ctse.product_catelog_service.config.S3Properties;
import com.ctse.product_catelog_service.dto.ImageUploadResponse;
import com.ctse.product_catelog_service.exception.BadRequestException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;

import java.io.IOException;
import java.time.LocalDate;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class S3ImageStorageService implements ImageStorageService {

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg", "image/png", "image/webp", "image/gif"
    );

    private final S3Client s3Client;
    private final S3Properties s3Properties;

    @Override
    public ImageUploadResponse uploadProductImage(MultipartFile file) {
        validateFile(file);

        String objectKey = buildObjectKey(file.getOriginalFilename());

        try {
            PutObjectRequest request = PutObjectRequest.builder()
                    .bucket(s3Properties.getBucket())
                    .key(objectKey)
                    .contentType(file.getContentType())
                    .build();

            s3Client.putObject(request, RequestBody.fromBytes(file.getBytes()));
        } catch (IOException ex) {
            throw new BadRequestException("Failed to read image file");
        } catch (S3Exception ex) {
            throw new BadRequestException("Failed to upload image to S3: " + ex.awsErrorDetails().errorMessage());
        }

        return ImageUploadResponse.builder()
                .key(objectKey)
                .url(buildPublicUrl(objectKey))
                .contentType(file.getContentType())
                .size(file.getSize())
                .build();
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Image file is required");
        }

        if (file.getContentType() == null || !ALLOWED_CONTENT_TYPES.contains(file.getContentType())) {
            throw new BadRequestException("Unsupported image type. Use JPEG, PNG, WEBP, or GIF");
        }
    }

    private String buildObjectKey(String originalFilename) {
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf('.')).toLowerCase();
        }

        LocalDate now = LocalDate.now();
        String prefix = s3Properties.getKeyPrefix() == null || s3Properties.getKeyPrefix().isBlank()
                ? "products"
                : s3Properties.getKeyPrefix().trim();

        return String.format("%s/%d/%02d/%s%s",
                prefix,
                now.getYear(),
                now.getMonthValue(),
                UUID.randomUUID(),
                extension);
    }

    private String buildPublicUrl(String key) {
        return String.format("https://%s.s3.%s.amazonaws.com/%s",
                s3Properties.getBucket(),
                s3Properties.getRegion(),
                key);
    }
}
