using Domain.Entities;

namespace Application.Features.Questions;

public record QuestionResponseDto(int Id, string Title, string? TitleAr, string Answer, string? AnswerAr, int CategoryId, int SubCategoryId, QuestionLevel? Level, bool IsActive, DateTime CreatedAt, string? CategoryName = null, string? SubCategoryName = null);

public record QuestionListDto(int Id, string Title, string? TitleAr, int CategoryId, int SubCategoryId, QuestionLevel? Level, bool IsActive, DateTime CreatedAt, string? CategoryName = null, string? SubCategoryName = null);

public record QuestionListFilter(
    int? CategoryId = null,
    int? SubCategoryId = null,
    QuestionLevel? Level = null,
    bool? IsActive = true,
    int Page = 1,
    int PageSize = 20,
    string SortBy = "CreatedAt",
    bool SortDescending = true
);

public record CreateQuestionDto(string Title, string? TitleAr, string? Answer, string? AnswerAr, int CategoryId, int SubCategoryId, QuestionLevel Level, bool IsActive = true);

public record UpdateQuestionDto(string Title, string? TitleAr, string? Answer, string? AnswerAr, int CategoryId, int SubCategoryId, QuestionLevel Level, bool IsActive);
