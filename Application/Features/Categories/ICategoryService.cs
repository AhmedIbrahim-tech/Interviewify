using Application.Common;

namespace Application.Features.Categories;

public interface ICategoryService
{
    Task<ApiResult<IReadOnlyList<CategoryResponseDto>>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<ApiResult<CategoryResponseDto?>> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<ApiResult<CategoryResponseDto>> CreateAsync(CreateCategoryDto dto, CancellationToken cancellationToken = default);
    Task<ApiResult<CategoryResponseDto>> UpdateAsync(int id, UpdateCategoryDto dto, CancellationToken cancellationToken = default);
    Task<ApiResult<bool>> DeleteAsync(int id, CancellationToken cancellationToken = default);
}
