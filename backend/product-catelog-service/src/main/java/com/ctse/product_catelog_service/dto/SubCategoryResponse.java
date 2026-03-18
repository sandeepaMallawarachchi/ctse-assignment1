package com.ctse.product_catelog_service.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class SubCategoryResponse {
    private String name;
    private String slug;
}
