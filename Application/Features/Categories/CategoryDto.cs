using Application.Features.SubCategories;

namespace Application.Features.Categories;

public record CategoryResponseDto(
    int Id, 
    string Name, 
    bool IsActive, 
    IReadOnlyList<SubCategoryResponseDto> SubCategories
);

public record CreateCategoryDto(
    string Name, 
    bool IsActive = true
);

public record UpdateCategoryDto(
    string Name, 
    bool IsActive
);
