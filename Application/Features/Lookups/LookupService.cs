using Application.Common;
using Application.Interfaces;
using Domian.Entities;

namespace Application.Features.Lookups;

public class LookupService : ILookupService
{
    private readonly ICategoryRepository _categoryRepository;
    private readonly ISubCategoryRepository _subCategoryRepository;
    private readonly IUserRepository _userRepository;

    public LookupService(
        ICategoryRepository categoryRepository,
        ISubCategoryRepository subCategoryRepository,
        IUserRepository userRepository)
    {
        _categoryRepository = categoryRepository;
        _subCategoryRepository = subCategoryRepository;
        _userRepository = userRepository;
    }

    public async Task<ApiResult<IEnumerable<LookupDto>>> GetRolesAsync(CancellationToken cancellationToken = default)
    {
        var roles = Enum.GetValues<Role>()
            .Select(r => new LookupDto(r.ToString(), r.ToString()));
        
        return await Task.FromResult(ApiResult<IEnumerable<LookupDto>>.Success(roles));
    }

    public async Task<ApiResult<IEnumerable<LookupDto>>> GetStatusesAsync(CancellationToken cancellationToken = default)
    {
        var statuses = Enum.GetValues<UserStatus>()
            .Select(s => new LookupDto(s.ToString(), s.ToString()));
        
        return await Task.FromResult(ApiResult<IEnumerable<LookupDto>>.Success(statuses));
    }

    public async Task<ApiResult<IEnumerable<LookupDto>>> GetCategoriesAsync(CancellationToken cancellationToken = default)
    {
        var categories = await _categoryRepository.GetAllAsync(cancellationToken);
        var result = categories.Select(c => new LookupDto(c.Id, c.Name));
        
        return ApiResult<IEnumerable<LookupDto>>.Success(result);
    }

    public async Task<ApiResult<IEnumerable<LookupDto>>> GetSubCategoriesAsync(int? categoryId = null, CancellationToken cancellationToken = default)
    {
        var list = await _subCategoryRepository.GetAllAsync(cancellationToken);
        
        if (categoryId.HasValue)
        {
            list = list.Where(s => s.CategoryId == categoryId.Value).ToList();
        }

        var result = list.Select(s => new LookupDto(s.Id, s.Name));
        return ApiResult<IEnumerable<LookupDto>>.Success(result);
    }

    public async Task<ApiResult<IEnumerable<LookupDto>>> GetUsersAsync(CancellationToken cancellationToken = default)
    {
        var users = await _userRepository.GetAllAsync(cancellationToken);
        var result = users.Select(u => new LookupDto(u.Id, u.FullName));
        
        return ApiResult<IEnumerable<LookupDto>>.Success(result);
    }
}
