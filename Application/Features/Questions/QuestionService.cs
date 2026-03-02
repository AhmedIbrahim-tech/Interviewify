using Application.Common;
using Application.Interfaces;
using Domian.Entities;

namespace Application.Features.Questions;

public class QuestionService : IQuestionService
{
    private readonly IQuestionRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public QuestionService(IQuestionRepository repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResult<IReadOnlyList<QuestionResponseDto>>> GetBySubCategoryIdAsync(int subCategoryId, CancellationToken cancellationToken = default)
    {
        var list = await _repository.GetBySubCategoryIdAsync(subCategoryId, cancellationToken);
        var dtos = list.Select(e => new QuestionResponseDto(e.Id, e.Title, e.Answer, e.CategoryId, e.SubCategoryId, e.IsActive, e.CreatedAt)).ToList();
        return ApiResult<IReadOnlyList<QuestionResponseDto>>.Success(dtos);
    }

    public async Task<ApiResult<QuestionResponseDto?>> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(id, cancellationToken);
        if (entity == null)
            return ApiResult<QuestionResponseDto?>.Failure("Question not found.");
        return ApiResult<QuestionResponseDto?>.Success(new QuestionResponseDto(entity.Id, entity.Title, entity.Answer, entity.CategoryId, entity.SubCategoryId, entity.IsActive, entity.CreatedAt));
    }

    public async Task<ApiResult<QuestionResponseDto>> CreateAsync(CreateQuestionDto dto, CancellationToken cancellationToken = default)
    {
        var entity = new Question
        {
            Title = dto.Title,
            Answer = dto.Answer,
            CategoryId = dto.CategoryId,
            SubCategoryId = dto.SubCategoryId,
            IsActive = dto.IsActive
        };
        await _repository.AddAsync(entity, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return ApiResult<QuestionResponseDto>.Success(new QuestionResponseDto(entity.Id, entity.Title, entity.Answer, entity.CategoryId, entity.SubCategoryId, entity.IsActive, entity.CreatedAt));
    }

    public async Task<ApiResult<QuestionResponseDto>> UpdateAsync(int id, UpdateQuestionDto dto, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(id, cancellationToken);
        if (entity == null)
            return ApiResult<QuestionResponseDto>.Failure("Question not found.");
        entity.Title = dto.Title;
        entity.Answer = dto.Answer;
        entity.IsActive = dto.IsActive;
        _repository.Update(entity);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return ApiResult<QuestionResponseDto>.Success(new QuestionResponseDto(entity.Id, entity.Title, entity.Answer, entity.CategoryId, entity.SubCategoryId, entity.IsActive, entity.CreatedAt));
    }

    public async Task<ApiResult<bool>> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(id, cancellationToken);
        if (entity == null)
            return ApiResult<bool>.Failure("Question not found.");
        _repository.Delete(entity);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return ApiResult<bool>.Success(true);
    }
}
