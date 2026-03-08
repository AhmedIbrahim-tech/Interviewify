namespace Application.Features.Users;

public record UserResponseDto(int Id, string FullName, string Email, string Role, string Status, string? ProfilePicture);

public record CreateUserDto(string FullName, string Email, string Password, string Role, string? ProfilePicture);

public record UpdateUserDto(string FullName, string Email, string Role, string? ProfilePicture);

public record UpdateProfileDto(string FullName, string Email, string? ProfilePicture);

public record ChangePasswordDto(string CurrentPassword, string NewPassword);
