namespace Application.Features.Categories;

public record CategoryResponseDto(int Id, string Name, bool IsActive);

public record CreateCategoryDto(string Name, bool IsActive = true);

public record UpdateCategoryDto(string Name, bool IsActive);
