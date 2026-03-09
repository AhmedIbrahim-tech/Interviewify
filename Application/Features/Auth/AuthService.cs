using Application.Common;
using Application.Interfaces;
using Domain.Entities;

namespace Application.Features.Auth;

public class AuthService(
    IUserRepository userRepository,
    IRefreshTokenRepository refreshTokenRepository,
    IPasswordHasher passwordHasher,
    ITokenService tokenService,
    IUnitOfWork unitOfWork) : IAuthService
{
    public async Task<ApiResult<AuthResponseDto>> LoginAsync(LoginDto dto, CancellationToken cancellationToken = default)
    {
        var user = await userRepository.GetByEmailAsync(dto.Email, cancellationToken);
        if (user == null || !passwordHasher.Verify(dto.Password, user.PasswordHash))
            return ApiResult<AuthResponseDto>.Failure("Invalid email or password.");
        if (user.Status != UserStatus.Active)
            return ApiResult<AuthResponseDto>.Failure("User account is inactive.");

        var accessToken = tokenService.GenerateAccessToken(user.Id, user.Email, user.FullName, user.Role.ToString());
        var (refreshTokenValue, refreshExpiration) = tokenService.GenerateRefreshToken();
        var refreshTokenEntity = new RefreshToken
        {
            Token = refreshTokenValue,
            ExpirationDate = refreshExpiration,
            UserId = user.Id
        };
        await refreshTokenRepository.AddAsync(refreshTokenEntity, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResult<AuthResponseDto>.Success(new AuthResponseDto(
            accessToken,
            refreshTokenValue,
            tokenService.GetAccessTokenExpirationUtc(),
            user.FullName,
            user.Role.ToString(),
            user.Email,
            user.ProfilePicture,
            user.Id));
    }

    public async Task<ApiResult<AuthResponseDto>> RefreshTokenAsync(string refreshToken, CancellationToken cancellationToken = default)
    {
        var tokenEntity = await refreshTokenRepository.GetByTokenAsync(refreshToken, cancellationToken);
        if (tokenEntity == null || tokenEntity.IsRevoked || tokenEntity.ExpirationDate < DateTime.UtcNow)
            return ApiResult<AuthResponseDto>.Failure("Invalid or expired refresh token.");

        var user = await userRepository.GetByIdAsync(tokenEntity.UserId, cancellationToken);
        if (user == null)
            return ApiResult<AuthResponseDto>.Failure("User not found.");
        if (user.Status != UserStatus.Active)
            return ApiResult<AuthResponseDto>.Failure("User account is inactive.");

        var accessToken = tokenService.GenerateAccessToken(user.Id, user.Email, user.FullName, user.Role.ToString());
        tokenEntity.IsRevoked = true;
        refreshTokenRepository.Update(tokenEntity);
        var (newRefreshValue, newRefreshExpiration) = tokenService.GenerateRefreshToken();
        var newRefreshEntity = new RefreshToken
        {
            Token = newRefreshValue,
            ExpirationDate = newRefreshExpiration,
            UserId = user.Id
        };
        await refreshTokenRepository.AddAsync(newRefreshEntity, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResult<AuthResponseDto>.Success(new AuthResponseDto(
            accessToken,
            newRefreshValue,
            tokenService.GetAccessTokenExpirationUtc(),
            user.FullName,
            user.Role.ToString(),
            user.Email,
            user.ProfilePicture,
            user.Id));
    }

    public async Task<ApiResult<bool>> LogoutAsync(string refreshToken, CancellationToken cancellationToken = default)
    {
        var tokenEntity = await refreshTokenRepository.GetByTokenAsync(refreshToken, cancellationToken);
        if (tokenEntity != null && !tokenEntity.IsRevoked)
        {
            tokenEntity.IsRevoked = true;
            refreshTokenRepository.Update(tokenEntity);
            await unitOfWork.SaveChangesAsync(cancellationToken);
        }
        return ApiResult<bool>.Success(true);
    }
}
