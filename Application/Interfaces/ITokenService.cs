namespace Application.Interfaces;

public interface ITokenService
{
    string GenerateAccessToken(int userId, string email, string fullName, string role);
    (string Token, DateTime ExpirationDate) GenerateRefreshToken();
}
