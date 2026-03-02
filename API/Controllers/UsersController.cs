using Application.Common;
using Application.Features.Users;
using API.Routes;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route(ApiRoutes.Users.Controller)]
[Authorize(Roles = "Admin")]
public class UsersController(IUserService userService) : ControllerBase
{
    [HttpGet(ApiRoutes.Users.GetAll)]
    public async Task<ActionResult<ApiResult<IReadOnlyList<UserResponseDto>>>> GetAll(CancellationToken cancellationToken)
    {
        var result = await userService.GetAllAsync(cancellationToken);
        if (!result.IsSuccess) return BadRequest(result);
        return Ok(result);
    }

    [HttpGet(ApiRoutes.Users.Id)]
    public async Task<ActionResult<ApiResult<UserResponseDto?>>> GetById(int id, CancellationToken cancellationToken)
    {
        var result = await userService.GetByIdAsync(id, cancellationToken);
        if (!result.IsSuccess) return BadRequest(result);
        if (result.Data == null) return NotFound(result);
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<ApiResult<UserResponseDto>>> CreateUser([FromBody] CreateUserDto dto, [FromServices] IValidator<CreateUserDto> validator, CancellationToken cancellationToken)
    {
        var validation = await validator.ValidateAsync(dto, cancellationToken);
        if (!validation.IsValid)
            return BadRequest(ApiResult<UserResponseDto>.Failure("Validation failed", validation.Errors.Select(e => e.ErrorMessage)));
        var result = await userService.CreateUserAsync(dto, cancellationToken);
        if (!result.IsSuccess) return BadRequest(result);
        return CreatedAtAction(nameof(GetById), new { id = result.Data!.Id }, result);
    }

    [HttpPut(ApiRoutes.Users.Id)]
    public async Task<ActionResult<ApiResult<UserResponseDto>>> UpdateUser(int id, [FromBody] UpdateUserDto dto, [FromServices] IValidator<UpdateUserDto> validator, CancellationToken cancellationToken)
    {
        var validation = await validator.ValidateAsync(dto, cancellationToken);
        if (!validation.IsValid)
            return BadRequest(ApiResult<UserResponseDto>.Failure("Validation failed", validation.Errors.Select(e => e.ErrorMessage)));
        var result = await userService.UpdateUserAsync(id, dto, cancellationToken);
        if (!result.IsSuccess) return BadRequest(result);
        return Ok(result);
    }

    [HttpDelete(ApiRoutes.Users.Id)]
    public async Task<ActionResult<ApiResult<bool>>> DeleteUser(int id, CancellationToken cancellationToken)
    {
        var result = await userService.DeleteUserAsync(id, cancellationToken);
        if (!result.IsSuccess) return BadRequest(result);
        return Ok(result);
    }

    [HttpPatch(ApiRoutes.Users.ToggleStatus)]
    public async Task<ActionResult<ApiResult<UserResponseDto>>> ToggleStatus(int id, CancellationToken cancellationToken)
    {
        var result = await userService.ToggleStatusAsync(id, cancellationToken);
        if (!result.IsSuccess) return BadRequest(result);
        return Ok(result);
    }
}
