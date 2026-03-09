using Application.Features.SubCategories;

namespace Application.Features.Categories;

public record CategoryResponseDto(
    int Id, 
    string Name, 
    string? Description, 
    bool IsActive, 
    IReadOnlyList<SubCategoryResponseDto> SubCategories
);

public record CreateCategoryDto(
    string Name, 
    string? Description = null, 
    bool IsActive = true
);

public record UpdateCategoryDto(
    string Name, 
    string? Description, 
    bool IsActive
);
