using Application.Common;

namespace Application.Features.Questions;

public interface IQuestionService
{
    Task<ApiResult<IReadOnlyList<QuestionResponseDto>>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<ApiResult<IReadOnlyList<QuestionResponseDto>>> GetByCategoryIdAsync(int categoryId, CancellationToken cancellationToken = default);
    Task<ApiResult<IReadOnlyList<QuestionResponseDto>>> GetBySubCategoryIdAsync(int subCategoryId, CancellationToken cancellationToken = default);
    Task<ApiResult<QuestionResponseDto?>> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<ApiResult<QuestionResponseDto>> CreateAsync(CreateQuestionDto dto, CancellationToken cancellationToken = default);
    Task<ApiResult<QuestionResponseDto>> UpdateAsync(int id, UpdateQuestionDto dto, CancellationToken cancellationToken = default);
    Task<ApiResult<bool>> DeleteAsync(int id, CancellationToken cancellationToken = default);
}
