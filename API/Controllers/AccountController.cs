using System.Security.Claims;
using Application.Common;
using Application.Features.Categories;
using Application.Features.Questions;
using Application.Features.Users;
using Application.Interfaces;
using API.Routes;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route(ApiRoutes.Account.Controller)]
[Authorize]
public class AccountController(
    IUserService userService,
    ICategoryService categoryService,
    IQuestionService questionService,
    ICurrentUserService currentUserService) : ControllerBase
{
    private int UserId => currentUserService.GetUserId();

    [HttpGet(ApiRoutes.Account.Stats)]
    public async Task<ActionResult<ApiResult<StatsDto>>> GetStats(CancellationToken cancellationToken)
    {
        var catResult = await categoryService.GetAllAsync(activeOnly: false, cancellationToken);
        var quesResult = await questionService.GetAllAsync(cancellationToken);
        int categoryCount = catResult.Data?.Count ?? 0;
        int questionCount = quesResult.Data?.Count ?? 0;
        int? userCount = null;
        if (User.IsInRole("Admin"))
        {
            var userResult = await userService.GetAllAsync(cancellationToken);
            userCount = userResult.Data?.Count ?? 0;
        }
        var stats = new StatsDto(categoryCount, questionCount, userCount);
        return Ok(ApiResult<StatsDto>.Success(stats));
    }

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
