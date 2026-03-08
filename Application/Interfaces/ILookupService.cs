using Application.Common;

namespace Application.Interfaces;

public interface ILookupService
{
    Task<ApiResult<IEnumerable<LookupDto>>> GetRolesAsync(CancellationToken cancellationToken = default);
    Task<ApiResult<IEnumerable<LookupDto>>> GetCategoriesAsync(CancellationToken cancellationToken = default);
    Task<ApiResult<IEnumerable<LookupDto>>> GetSubCategoriesAsync(int? categoryId = null, CancellationToken cancellationToken = default);
    Task<ApiResult<IEnumerable<LookupDto>>> GetUsersAsync(CancellationToken cancellationToken = default);
    Task<ApiResult<IEnumerable<LookupDto>>> GetStatusesAsync(CancellationToken cancellationToken = default);
}
