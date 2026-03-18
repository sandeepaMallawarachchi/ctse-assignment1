package com.ctse.product_catelog_service.service.impl;

import com.ctse.product_catelog_service.dto.CategoryCreateRequest;
import com.ctse.product_catelog_service.dto.CategoryResponse;
import com.ctse.product_catelog_service.dto.SubCategoryCreateRequest;
import com.ctse.product_catelog_service.dto.SubCategoryResponse;
import com.ctse.product_catelog_service.exception.BadRequestException;
import com.ctse.product_catelog_service.exception.ResourceNotFoundException;
import com.ctse.product_catelog_service.model.Category;
import com.ctse.product_catelog_service.model.SubCategory;
import com.ctse.product_catelog_service.repository.CategoryRepository;
import com.ctse.product_catelog_service.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;

    @Override
    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public CategoryResponse createCategory(CategoryCreateRequest request) {
        String normalizedName = request.getName().trim();
        String slug = toSlug(normalizedName);

        if (categoryRepository.findBySlug(slug).isPresent()) {
            throw new BadRequestException("Category already exists: " + normalizedName);
        }

        Category category = Category.builder()
                .name(normalizedName)
                .slug(slug)
                .iconKey(request.getIconKey().trim())
                .build();

        return toResponse(categoryRepository.save(category));
    }

    @Override
    public CategoryResponse addSubCategory(String categoryId, SubCategoryCreateRequest request) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + categoryId));

        String normalizedName = request.getName().trim();
        String slug = toSlug(normalizedName);

        boolean exists = category.getSubCategories().stream()
                .anyMatch(subCategory -> subCategory.getSlug().equals(slug));

        if (exists) {
            throw new BadRequestException("Subcategory already exists: " + normalizedName);
        }

        category.getSubCategories().add(SubCategory.builder()
                .name(normalizedName)
                .slug(slug)
                .build());

        return toResponse(categoryRepository.save(category));
    }

    private CategoryResponse toResponse(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .slug(category.getSlug())
                .iconKey(category.getIconKey())
                .subCategories(category.getSubCategories().stream()
                        .map(subCategory -> SubCategoryResponse.builder()
                                .name(subCategory.getName())
                                .slug(subCategory.getSlug())
                                .build())
                        .toList())
                .createdAt(category.getCreatedAt())
                .updatedAt(category.getUpdatedAt())
                .build();
    }

    private String toSlug(String value) {
        return value.toLowerCase(Locale.ROOT)
                .trim()
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("^-+|-+$", "");
    }
}
