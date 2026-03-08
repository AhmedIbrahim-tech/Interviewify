namespace Application.Features.Auth;

public record LoginDto(string Email, string Password);

public record AuthResponseDto(string AccessToken, string RefreshToken, DateTime AccessTokenExpiration, string UserName, string Role, string Email, string? ProfilePicture, int Id);

public record RefreshTokenRequestDto(string RefreshToken);
