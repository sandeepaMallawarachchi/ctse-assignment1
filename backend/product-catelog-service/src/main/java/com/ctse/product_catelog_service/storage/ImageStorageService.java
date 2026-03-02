package com.ctse.product_catelog_service.storage;

import com.ctse.product_catelog_service.dto.ImageUploadResponse;
import org.springframework.web.multipart.MultipartFile;

public interface ImageStorageService {
    ImageUploadResponse uploadProductImage(MultipartFile file);
}
