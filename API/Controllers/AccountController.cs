using System.Security.Claims;
using Application.Common;
using Application.Features.Users;
using API.Routes;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route(ApiRoutes.Account.Controller)]
[Authorize]
public class AccountController(IUserService userService) : ControllerBase
{
    private int UserId => int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

    [HttpGet(ApiRoutes.Account.Profile)]
    public async Task<ActionResult<ApiResult<UserResponseDto?>>> GetProfile(CancellationToken cancellationToken)
    {
        var result = await userService.GetByIdAsync(UserId, cancellationToken);
        if (!result.IsSuccess) return BadRequest(result);
        return Ok(result);
    }

    [HttpPut(ApiRoutes.Account.Profile)]
    public async Task<ActionResult<ApiResult<UserResponseDto>>> UpdateProfile([FromBody] UpdateProfileDto dto, [FromServices] IValidator<UpdateProfileDto> validator, CancellationToken cancellationToken)
    {
        var validation = await validator.ValidateAsync(dto, cancellationToken);
        if (!validation.IsValid)
            return BadRequest(ApiResult<UserResponseDto>.Failure("Validation failed", validation.Errors.Select(e => e.ErrorMessage)));
            
        var result = await userService.UpdateProfileAsync(UserId, dto, cancellationToken);
        if (!result.IsSuccess) return BadRequest(result);
        return Ok(result);
    }

    [HttpPatch(ApiRoutes.Account.ChangePassword)]
    public async Task<ActionResult<ApiResult<bool>>> ChangePassword([FromBody] ChangePasswordDto dto, [FromServices] IValidator<ChangePasswordDto> validator, CancellationToken cancellationToken)
    {
        var validation = await validator.ValidateAsync(dto, cancellationToken);
        if (!validation.IsValid)
            return BadRequest(ApiResult<bool>.Failure("Validation failed", validation.Errors.Select(e => e.ErrorMessage)));
            
        var result = await userService.ChangePasswordAsync(UserId, dto, cancellationToken);
        if (!result.IsSuccess) return BadRequest(result);
        return Ok(result);
    }
}
