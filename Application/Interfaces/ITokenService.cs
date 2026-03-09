namespace Application.Interfaces;

public interface ITokenService
{
    string GenerateAccessToken(int userId, string email, string fullName, string role);
    (string Token, DateTime ExpirationDate) GenerateRefreshToken();
    /// <summary>Returns the UTC time when the access token issued at this moment would expire (for DTO).</summary>
    DateTime GetAccessTokenExpirationUtc();
}
