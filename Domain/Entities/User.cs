namespace Domain.Entities;

public class User
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public Role Role { get; set; } = Role.User;
    public UserStatus Status { get; set; } = UserStatus.Active;
    public string? ProfilePicture { get; set; }

    public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
}

public enum Role
{
    Admin,
    User
}   

public enum UserStatus
{
    Active,
    Inactive
}
