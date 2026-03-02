using Application.Common;
using Application.Features.Questions;
using API.Routes;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route(ApiRoutes.Questions.Controller)]
public class QuestionsController(IQuestionService service) : ControllerBase
{
    [HttpGet(ApiRoutes.Questions.BySubCategoryId)]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResult<IReadOnlyList<QuestionResponseDto>>>> GetBySubCategoryId(int subCategoryId, CancellationToken cancellationToken)
    {
        var result = await service.GetBySubCategoryIdAsync(subCategoryId, cancellationToken);
        if (!result.IsSuccess) return BadRequest(result);
        return Ok(result);
    }

    [HttpGet(ApiRoutes.Questions.Id)]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResult<QuestionResponseDto?>>> GetById(int id, CancellationToken cancellationToken)
    {
        var result = await service.GetByIdAsync(id, cancellationToken);
        if (!result.IsSuccess) return BadRequest(result);
        if (result.Data == null) return NotFound(result);
        return Ok(result);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResult<QuestionResponseDto>>> Create([FromBody] CreateQuestionDto dto, CancellationToken cancellationToken)
    {
        var result = await service.CreateAsync(dto, cancellationToken);
        if (!result.IsSuccess) return BadRequest(result);
        return CreatedAtAction(nameof(GetById), new { id = result.Data!.Id }, result);
    }

    [HttpPut(ApiRoutes.Questions.Id)]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResult<QuestionResponseDto>>> Update(int id, [FromBody] UpdateQuestionDto dto, CancellationToken cancellationToken)
    {
        var result = await service.UpdateAsync(id, dto, cancellationToken);
        if (!result.IsSuccess) return BadRequest(result);
        return Ok(result);
    }

    [HttpDelete(ApiRoutes.Questions.Id)]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResult<bool>>> Delete(int id, CancellationToken cancellationToken)
    {
        var result = await service.DeleteAsync(id, cancellationToken);
        if (!result.IsSuccess) return BadRequest(result);
        return Ok(result);
    }
}
