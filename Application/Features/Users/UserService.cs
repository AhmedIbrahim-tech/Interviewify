using Application.Common;
using Application.Interfaces;
using Domian.Entities;

namespace Application.Features.Users;

public class UserService(
    IUserRepository userRepository,
    IPasswordHasher passwordHasher,
    IUnitOfWork unitOfWork) : IUserService
{
    public async Task<ApiResult<IReadOnlyList<UserResponseDto>>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var users = await userRepository.GetAllAsync(cancellationToken);
        var dtos = users.Select(u => new UserResponseDto(u.Id, u.FullName, u.Email, u.Role.ToString(), u.Status.ToString())).ToList();
        return ApiResult<IReadOnlyList<UserResponseDto>>.Success(dtos);
    }

    public async Task<ApiResult<UserResponseDto?>> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var user = await userRepository.GetByIdAsync(id, cancellationToken);
        if (user == null)
            return ApiResult<UserResponseDto?>.Failure("User not found.");
        return ApiResult<UserResponseDto?>.Success(new UserResponseDto(user.Id, user.FullName, user.Email, user.Role.ToString(), user.Status.ToString()));
    }

    public async Task<ApiResult<UserResponseDto>> CreateUserAsync(CreateUserDto dto, CancellationToken cancellationToken = default)
    {
        var existing = await userRepository.GetByEmailAsync(dto.Email, cancellationToken);
        if (existing != null)
            return ApiResult<UserResponseDto>.Failure("User with this email already exists.");

        var user = new User
        {
            FullName = dto.FullName,
            Email = dto.Email,
            PasswordHash = passwordHasher.Hash(dto.Password),
            Role = Enum.Parse<Role>(dto.Role),
            Status = UserStatus.Active
        };
        await userRepository.AddAsync(user, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResult<UserResponseDto>.Success(new UserResponseDto(user.Id, user.FullName, user.Email, user.Role.ToString(), user.Status.ToString()));
    }

    public async Task<ApiResult<UserResponseDto>> UpdateUserAsync(int id, UpdateUserDto dto, CancellationToken cancellationToken = default)
    {
        var user = await userRepository.GetByIdAsync(id, cancellationToken);
        if (user == null)
            return ApiResult<UserResponseDto>.Failure("User not found.");

        var existingByEmail = await userRepository.GetByEmailAsync(dto.Email, cancellationToken);
        if (existingByEmail != null && existingByEmail.Id != id)
            return ApiResult<UserResponseDto>.Failure("Another user with this email already exists.");

        user.FullName = dto.FullName;
        user.Email = dto.Email;
        user.Role = Enum.Parse<Role>(dto.Role);
        userRepository.Update(user);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResult<UserResponseDto>.Success(new UserResponseDto(user.Id, user.FullName, user.Email, user.Role.ToString(), user.Status.ToString()));
    }

    public async Task<ApiResult<bool>> DeleteUserAsync(int id, CancellationToken cancellationToken = default)
    {
        var user = await userRepository.GetByIdAsync(id, cancellationToken);
        if (user == null)
            return ApiResult<bool>.Failure("User not found.");

        userRepository.Delete(user);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return ApiResult<bool>.Success(true);
    }

    public async Task<ApiResult<UserResponseDto>> ToggleStatusAsync(int id, CancellationToken cancellationToken = default)
    {
        var user = await userRepository.GetByIdAsync(id, cancellationToken);
        if (user == null)
            return ApiResult<UserResponseDto>.Failure("User not found.");

        user.Status = user.Status == UserStatus.Active ? UserStatus.Inactive : UserStatus.Active;
        userRepository.Update(user);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResult<UserResponseDto>.Success(new UserResponseDto(user.Id, user.FullName, user.Email, user.Role.ToString(), user.Status.ToString()));
    }
}
