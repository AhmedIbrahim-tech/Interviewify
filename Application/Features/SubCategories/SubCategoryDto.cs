namespace Application.Features.SubCategories;

public record SubCategoryResponseDto(int Id, string Name, int CategoryId);

public record CreateSubCategoryDto(string Name, int CategoryId);

public record UpdateSubCategoryDto(string Name);
