namespace Application.Features.SubCategories;

public record SubCategoryResponseDto(int Id, string Name, int CategoryId, int DisplayOrder, string? CategoryName = null);

public record CreateSubCategoryDto(string Name, int CategoryId, int DisplayOrder = 0);

public record UpdateSubCategoryDto(string Name, int DisplayOrder = 0);
