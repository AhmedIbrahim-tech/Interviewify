using Application.Common;
using Application.Features.Categories;
using API.Routes;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route(ApiRoutes.Categories.Controller)]
public class CategoriesController(ICategoryService service) : ControllerBase
{
    [HttpGet(ApiRoutes.Categories.GetAll)]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll([FromQuery] bool activeOnly = false, CancellationToken cancellationToken = default)
    {
        var result = await service.GetAllAsync(activeOnly, cancellationToken);
        if (!result.IsSuccess) return BadRequest(result);
        return Ok(result);
    }

    [HttpGet(ApiRoutes.Categories.Id)]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
    {
        var result = await service.GetByIdAsync(id, cancellationToken);
        if (!result.IsSuccess) return BadRequest(result);
        if (result.Data == null) return NotFound(result);
        return Ok(result);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] CreateCategoryDto dto, CancellationToken cancellationToken)
    {
        var result = await service.CreateAsync(dto, cancellationToken);
        if (!result.IsSuccess) return BadRequest(result);
        return CreatedAtAction(nameof(GetById), new { id = result.Data!.Id }, result);
    }

    [HttpPut(ApiRoutes.Categories.Id)]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateCategoryDto dto, CancellationToken cancellationToken)
    {
        var result = await service.UpdateAsync(id, dto, cancellationToken);
        if (!result.IsSuccess) return BadRequest(result);
        return Ok(result);
    }

    [HttpPatch(ApiRoutes.Categories.ToggleStatus)]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> ToggleStatus(int id, CancellationToken cancellationToken)
    {
        var result = await service.ToggleStatusAsync(id, cancellationToken);
        if (!result.IsSuccess) return BadRequest(result);
        return Ok(result);
    }

    [HttpDelete(ApiRoutes.Categories.Id)]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var result = await service.DeleteAsync(id, cancellationToken);
        if (!result.IsSuccess) return BadRequest(result);
        return Ok(result);
    }
}
