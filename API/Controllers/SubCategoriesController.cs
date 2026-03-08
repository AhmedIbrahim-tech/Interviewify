using Application.Common;
using Application.Features.SubCategories;
using API.Routes;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route(ApiRoutes.SubCategories.Controller)]
public class SubCategoriesController(ISubCategoryService service) : ControllerBase
{
    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResult<IReadOnlyList<SubCategoryResponseDto>>>> GetAll(CancellationToken cancellationToken)
    {
        var result = await service.GetAllAsync(cancellationToken);
        if (!result.IsSuccess) return BadRequest(result);
        return Ok(result);
    }

    [HttpGet(ApiRoutes.SubCategories.Id)]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResult<SubCategoryResponseDto>>> GetById(int id, CancellationToken cancellationToken)
    {
        var result = await service.GetByIdAsync(id, cancellationToken);
        if (!result.IsSuccess) return BadRequest(result);
        return Ok(result);
    }

    [HttpGet(ApiRoutes.SubCategories.ByCategoryId)]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResult<IReadOnlyList<SubCategoryResponseDto>>>> GetByCategoryId(int categoryId, CancellationToken cancellationToken)
    {
        var result = await service.GetByCategoryIdAsync(categoryId, cancellationToken);
        if (!result.IsSuccess) return BadRequest(result);
        return Ok(result);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResult<SubCategoryResponseDto>>> Create([FromBody] CreateSubCategoryDto dto, CancellationToken cancellationToken)
    {
        var result = await service.CreateAsync(dto, cancellationToken);
        if (!result.IsSuccess) return BadRequest(result);
        var data = result.Data!;
        return CreatedAtAction(nameof(GetByCategoryId), new { categoryId = data.CategoryId }, result);
    }

    [HttpPut(ApiRoutes.SubCategories.Id)]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResult<SubCategoryResponseDto>>> Update(int id, [FromBody] UpdateSubCategoryDto dto, CancellationToken cancellationToken)
    {
        var result = await service.UpdateAsync(id, dto, cancellationToken);
        if (!result.IsSuccess) return BadRequest(result);
        return Ok(result);
    }

    [HttpDelete(ApiRoutes.SubCategories.Id)]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResult<bool>>> Delete(int id, CancellationToken cancellationToken)
    {
        var result = await service.DeleteAsync(id, cancellationToken);
        if (!result.IsSuccess) return BadRequest(result);
        return Ok(result);
    }
}
