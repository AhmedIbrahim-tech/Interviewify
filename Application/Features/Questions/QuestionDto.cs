namespace Application.Features.Questions;

public record QuestionResponseDto(int Id, string Title, string Answer, int CategoryId, int SubCategoryId, bool IsActive, DateTime CreatedAt);

public record CreateQuestionDto(string Title, string Answer, int CategoryId, int SubCategoryId, bool IsActive = true);

public record UpdateQuestionDto(string Title, string Answer, bool IsActive);
