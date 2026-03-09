using Application.Common;
using Application.Features.Auth;
using API.Routes;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route(ApiRoutes.Auth.Controller)]
public class AuthController(IAuthService authService) : ControllerBase
{
    [HttpPost(ApiRoutes.Auth.Login)]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResult<AuthResponseDto>>> Login([FromBody] LoginDto dto, [FromServices] IValidator<LoginDto> validator, CancellationToken cancellationToken)
    {
        var validation = await validator.ValidateAsync(dto, cancellationToken);
        if (!validation.IsValid)
            return BadRequest(ApiResult<AuthResponseDto>.Failure("Validation failed", validation.Errors.Select(e => e.ErrorMessage)));
        var result = await authService.LoginAsync(dto, cancellationToken);
        if (!result.IsSuccess) return Unauthorized(result);
        return Ok(result);
    }

    [HttpPost(ApiRoutes.Auth.Refresh)]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResult<AuthResponseDto>>> RefreshToken([FromBody] RefreshTokenRequestDto dto, [FromServices] IValidator<RefreshTokenRequestDto> validator, CancellationToken cancellationToken)
    {
        var validation = await validator.ValidateAsync(dto, cancellationToken);
        if (!validation.IsValid)
            return BadRequest(ApiResult<AuthResponseDto>.Failure("Validation failed", validation.Errors.Select(e => e.ErrorMessage)));
        var result = await authService.RefreshTokenAsync(dto.RefreshToken, cancellationToken);
        if (!result.IsSuccess) return Unauthorized(result);
        return Ok(result);
    }

    [HttpPost(ApiRoutes.Auth.Logout)]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResult<bool>>> Logout([FromBody] RefreshTokenRequestDto dto, [FromServices] IValidator<RefreshTokenRequestDto> validator, CancellationToken cancellationToken)
    {
        var validation = await validator.ValidateAsync(dto, cancellationToken);
        if (!validation.IsValid)
            return BadRequest(ApiResult<bool>.Failure("Validation failed", validation.Errors.Select(e => e.ErrorMessage)));
        var result = await authService.LogoutAsync(dto.RefreshToken, cancellationToken);
        return Ok(result);
    }
}
