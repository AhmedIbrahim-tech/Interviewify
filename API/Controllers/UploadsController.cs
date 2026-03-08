using Application.Common;
using Application.Interfaces;
using API.Routes;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route(ApiRoutes.Uploads.Controller)]
[Authorize]
public class UploadsController(IFileService fileService) : ControllerBase
{
    [HttpPost(ApiRoutes.Uploads.General)]
    public async Task<ActionResult<ApiResult<string>>> UploadGeneral(IFormFile file, [FromQuery] string? folder = "general", CancellationToken cancellationToken = default)
    {
        try
        {
            var sanitizedFolder = "general";
            if (!string.IsNullOrEmpty(folder)) 
            {
                sanitizedFolder = folder.Replace("..", "").Replace("/", "").Replace("\\", "");
                if (string.IsNullOrEmpty(sanitizedFolder)) sanitizedFolder = "general";
            }
            
            var destination = $"uploads/{sanitizedFolder}";
            var result = await fileService.SaveFileAsync(file, destination, cancellationToken);
            return Ok(ApiResult<string>.Success(result, "File uploaded successfully."));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResult<string>.Failure($"{ex.Message} \n {ex.StackTrace}"));
        }
    }

    [HttpDelete]
    public IActionResult DeleteFile([FromQuery] string filePath)
    {
        if (string.IsNullOrEmpty(filePath)) return BadRequest(ApiResult<bool>.Failure("File path is required."));
        
        // Security check - only allow deleting from uploads folder
        if (!filePath.StartsWith("/uploads/") && !filePath.StartsWith("uploads/"))
            return BadRequest(ApiResult<bool>.Failure("Action not allowed."));

        fileService.DeleteFile(filePath);
        return Ok(ApiResult<bool>.Success(true, "File deleted."));
    }
}
