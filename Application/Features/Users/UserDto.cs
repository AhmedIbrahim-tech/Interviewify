namespace Application.Features.Users;

public record UserResponseDto(int Id, string FullName, string Email, string Role, string Status);

public record CreateUserDto(string FullName, string Email, string Password, string Role);

public record UpdateUserDto(string FullName, string Email, string Role);
