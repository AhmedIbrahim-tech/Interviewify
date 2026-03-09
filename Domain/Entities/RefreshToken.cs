namespace Domain.Entities;

public class RefreshToken
{
    public int Id { get; set; }
    public string Token { get; set; } = string.Empty;
    public DateTime ExpirationDate { get; set; }
    public bool IsRevoked { get; set; }
    public int UserId { get; set; }

    public User User { get; set; } = null!;
}
