using Application.Common;

namespace Application.Features.Users;

public interface IUserService
{
    Task<ApiResult<IReadOnlyList<UserResponseDto>>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<ApiResult<UserResponseDto?>> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<ApiResult<UserResponseDto>> CreateUserAsync(CreateUserDto dto, CancellationToken cancellationToken = default);
    Task<ApiResult<UserResponseDto>> UpdateUserAsync(int id, UpdateUserDto dto, CancellationToken cancellationToken = default);
    Task<ApiResult<UserResponseDto>> UpdateProfileAsync(int id, UpdateProfileDto dto, CancellationToken cancellationToken = default);
    Task<ApiResult<bool>> ChangePasswordAsync(int id, ChangePasswordDto dto, CancellationToken cancellationToken = default);
    Task<ApiResult<bool>> DeleteUserAsync(int id, CancellationToken cancellationToken = default);
    Task<ApiResult<UserResponseDto>> ToggleStatusAsync(int id, CancellationToken cancellationToken = default);
}
