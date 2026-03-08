using Application.Interfaces;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;

namespace Infrastructure.Services;

public class LocalFileService(IWebHostEnvironment webHostEnvironment) : IFileService
{
    private string GetRootPath()
    {
        var currentDir = Directory.GetCurrentDirectory();
        if (string.IsNullOrEmpty(currentDir)) throw new InvalidOperationException("Current directory is null.");
        
        var root = webHostEnvironment.WebRootPath;
        if (string.IsNullOrWhiteSpace(root))
        {
            root = Path.Combine(currentDir, "wwwroot");
        }
        
        if (string.IsNullOrEmpty(root)) throw new InvalidOperationException("Root path decided is null.");

        if (!Directory.Exists(root))
        {
            Directory.CreateDirectory(root);
        }
        return root;
    }

    public async Task<string> SaveFileAsync(IFormFile file, string folderName, CancellationToken cancellationToken = default)
    {
        if (file == null) throw new ArgumentNullException(nameof(file));
        if (string.IsNullOrEmpty(folderName)) folderName = "general";

        var fileName = file.FileName ?? "unknown.bin";
        var extension = Path.GetExtension(fileName).ToLowerInvariant();
        
        var rootPath = GetRootPath();
        var uploadsPath = Path.Combine(rootPath, folderName);
        
        if (!Directory.Exists(uploadsPath))
            Directory.CreateDirectory(uploadsPath);

        var finalFileName = $"{Guid.NewGuid()}{extension}";
        var filePath = Path.Combine(uploadsPath, finalFileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream, cancellationToken);
        }

        return $"/{folderName.Trim('/')}/{finalFileName}";
    }

    public void DeleteFile(string filePath)
    {
        if (string.IsNullOrWhiteSpace(filePath)) return;
        
        var rootPath = GetRootPath();
        var fullPath = Path.Combine(rootPath, filePath.TrimStart('/'));
        if (File.Exists(fullPath))
        {
            File.Delete(fullPath);
        }
    }

    public bool Exists(string filePath)
    {
        if (string.IsNullOrWhiteSpace(filePath)) return false;
        var rootPath = GetRootPath();
        var fullPath = Path.Combine(rootPath, filePath.TrimStart('/'));
        return File.Exists(fullPath);
    }
}
