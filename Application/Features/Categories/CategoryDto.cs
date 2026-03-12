using Application.Features.SubCategories;

namespace Application.Features.Categories;

public record CategoryResponseDto(
    int Id,
    string Name,
    string? Description,
    bool IsActive,
    int DisplayOrder,
    IReadOnlyList<SubCategoryResponseDto> SubCategories
);

public record CreateCategoryDto(
    string Name,
    string? Description = null,
    bool IsActive = true,
    int DisplayOrder = 0
);

public record UpdateCategoryDto(
    string Name,
    string? Description,
    bool IsActive,
    int DisplayOrder
);
