package com.ctse.product_catelog_service.service;

import com.ctse.product_catelog_service.dto.CategoryCreateRequest;
import com.ctse.product_catelog_service.dto.CategoryResponse;
import com.ctse.product_catelog_service.dto.SubCategoryCreateRequest;

import java.util.List;

public interface CategoryService {
    List<CategoryResponse> getAllCategories();

    CategoryResponse createCategory(CategoryCreateRequest request);

    CategoryResponse addSubCategory(String categoryId, SubCategoryCreateRequest request);
}
