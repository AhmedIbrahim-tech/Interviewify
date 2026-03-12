namespace Domain.Entities;

public class Question
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? TitleAr { get; set; }
    public string Answer { get; set; } = string.Empty;
    public string? AnswerAr { get; set; }
    public int CategoryId { get; set; }
    public int SubCategoryId { get; set; }
    public QuestionLevel? Level { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Category Category { get; set; } = null!;
    public SubCategory SubCategory { get; set; } = null!;
}


public enum QuestionLevel
{
    Fresh = 0,
    Junior = 1,
    MidLevel = 2,
    Senior = 3
}
