namespace Domain.Entities;

public class Question
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Answer { get; set; } = string.Empty;
    public int CategoryId { get; set; }
    public int SubCategoryId { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Category Category { get; set; } = null!;
    public SubCategory SubCategory { get; set; } = null!;
}
