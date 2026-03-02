using Application.Common;

namespace Application.Features.SubCategories;

public interface ISubCategoryService
{
    Task<ApiResult<IReadOnlyList<SubCategoryResponseDto>>> GetByCategoryIdAsync(int categoryId, CancellationToken cancellationToken = default);
    Task<ApiResult<SubCategoryResponseDto>> CreateAsync(CreateSubCategoryDto dto, CancellationToken cancellationToken = default);
    Task<ApiResult<SubCategoryResponseDto>> UpdateAsync(int id, UpdateSubCategoryDto dto, CancellationToken cancellationToken = default);
    Task<ApiResult<bool>> DeleteAsync(int id, CancellationToken cancellationToken = default);
}
