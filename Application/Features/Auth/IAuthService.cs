using Application.Common;

namespace Application.Features.Auth;

public interface IAuthService
{
    Task<ApiResult<AuthResponseDto>> LoginAsync(LoginDto dto, CancellationToken cancellationToken = default);
    Task<ApiResult<AuthResponseDto>> RefreshTokenAsync(string refreshToken, CancellationToken cancellationToken = default);
    Task<ApiResult<bool>> LogoutAsync(string refreshToken, CancellationToken cancellationToken = default);
}
