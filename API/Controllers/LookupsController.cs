using Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LookupsController : ControllerBase
{
    private readonly ILookupService _lookupService;

    public LookupsController(ILookupService lookupService)
    {
        _lookupService = lookupService;
    }

    [HttpGet("roles")]
    public async Task<IActionResult> GetRoles(CancellationToken cancellationToken)
    {
        var result = await _lookupService.GetRolesAsync(cancellationToken);
        return Ok(result);
    }

    [HttpGet("categories")]
    public async Task<IActionResult> GetCategories(CancellationToken cancellationToken)
    {
        var result = await _lookupService.GetCategoriesAsync(cancellationToken);
        return Ok(result);
    }

    [HttpGet("sub-categories")]
    public async Task<IActionResult> GetSubCategories([FromQuery] int? categoryId, CancellationToken cancellationToken)
    {
        var result = await _lookupService.GetSubCategoriesAsync(categoryId, cancellationToken);
        return Ok(result);
    }

    [HttpGet("users")]
    public async Task<IActionResult> GetUsers(CancellationToken cancellationToken)
    {
        var result = await _lookupService.GetUsersAsync(cancellationToken);
        return Ok(result);
    }

    [HttpGet("statuses")]
    public async Task<IActionResult> GetStatuses(CancellationToken cancellationToken)
    {
        var result = await _lookupService.GetStatusesAsync(cancellationToken);
        return Ok(result);
    }
}
