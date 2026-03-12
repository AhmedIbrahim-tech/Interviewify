using Application.Common;
using Application.Interfaces;
using Domain.Entities;

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

    public async Task<ApiResult<IReadOnlyList<QuestionResponseDto>>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var list = await _repository.GetAllAsync(cancellationToken);
        var dtos = list.Select(e => new QuestionResponseDto(e.Id, e.Title, e.TitleAr, e.Answer, e.AnswerAr, e.CategoryId, e.SubCategoryId, e.Level, e.IsActive, e.CreatedAt, e.Category?.Name, e.SubCategory?.Name)).ToList();
        return ApiResult<IReadOnlyList<QuestionResponseDto>>.Success(dtos);
    }

    public async Task<ApiResult<IReadOnlyList<QuestionResponseDto>>> GetByCategoryIdAsync(int categoryId, CancellationToken cancellationToken = default)
    {
        var list = await _repository.GetByCategoryIdAsync(categoryId, cancellationToken);
        var dtos = list.Select(e => new QuestionResponseDto(e.Id, e.Title, e.TitleAr, e.Answer, e.AnswerAr, e.CategoryId, e.SubCategoryId, e.Level, e.IsActive, e.CreatedAt, e.Category?.Name, e.SubCategory?.Name)).ToList();
        return ApiResult<IReadOnlyList<QuestionResponseDto>>.Success(dtos);
    }

    public async Task<ApiResult<IReadOnlyList<QuestionResponseDto>>> GetBySubCategoryIdAsync(int subCategoryId, CancellationToken cancellationToken = default)
    {
        var list = await _repository.GetBySubCategoryIdAsync(subCategoryId, cancellationToken);
        var dtos = list.Select(e => new QuestionResponseDto(e.Id, e.Title, e.TitleAr, e.Answer, e.AnswerAr, e.CategoryId, e.SubCategoryId, e.Level, e.IsActive, e.CreatedAt, e.Category?.Name, e.SubCategory?.Name)).ToList();
        return ApiResult<IReadOnlyList<QuestionResponseDto>>.Success(dtos);
    }

    public async Task<ApiResult<PagedResult<QuestionListDto>>> GetPagedAsync(QuestionListFilter filter, CancellationToken cancellationToken = default)
    {
        var (items, totalCount) = await _repository.GetPagedAsync(
            filter.CategoryId, filter.SubCategoryId, filter.Level, filter.IsActive,
            filter.Page, filter.PageSize, filter.SortBy, filter.SortDescending, cancellationToken);
        var list = items.Select(e => new QuestionListDto(e.Id, e.Title, e.TitleAr, e.CategoryId, e.SubCategoryId, e.Level, e.IsActive, e.CreatedAt, e.Category?.Name, e.SubCategory?.Name)).ToList();
        var paged = new PagedResult<QuestionListDto>(list, totalCount, filter.Page, filter.PageSize);
        return ApiResult<PagedResult<QuestionListDto>>.Success(paged);
    }

    public async Task<ApiResult<QuestionResponseDto?>> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var e = await _repository.GetByIdAsync(id, cancellationToken);
        if (e == null)
            return ApiResult<QuestionResponseDto?>.Failure("Question not found.");
        return ApiResult<QuestionResponseDto?>.Success(new QuestionResponseDto(e.Id, e.Title, e.TitleAr, e.Answer, e.AnswerAr, e.CategoryId, e.SubCategoryId, e.Level, e.IsActive, e.CreatedAt, e.Category?.Name, e.SubCategory?.Name));
    }

    public async Task<ApiResult<QuestionResponseDto>> CreateAsync(CreateQuestionDto dto, CancellationToken cancellationToken = default)
    {
        var entity = new Question
        {
            Title = dto.Title,
            TitleAr = dto.TitleAr,
            Answer = dto.Answer ?? string.Empty,
            AnswerAr = dto.AnswerAr,
            CategoryId = dto.CategoryId,
            SubCategoryId = dto.SubCategoryId,
            Level = dto.Level,
            IsActive = dto.IsActive
        };
        await _repository.AddAsync(entity, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        
        var fullEntity = await _repository.GetByIdAsync(entity.Id, cancellationToken);
        return ApiResult<QuestionResponseDto>.Success(new QuestionResponseDto(entity.Id, entity.Title, entity.TitleAr, entity.Answer, entity.AnswerAr, entity.CategoryId, entity.SubCategoryId, entity.Level, entity.IsActive, entity.CreatedAt, fullEntity?.Category?.Name, fullEntity?.SubCategory?.Name));
    }

    public async Task<ApiResult<QuestionResponseDto>> UpdateAsync(int id, UpdateQuestionDto dto, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdForUpdateAsync(id, cancellationToken);
        if (entity == null)
            return ApiResult<QuestionResponseDto>.Failure("Question not found.");
        entity.Title = dto.Title;
        entity.TitleAr = dto.TitleAr;
        entity.Answer = dto.Answer ?? string.Empty;
        entity.AnswerAr = dto.AnswerAr;
        entity.CategoryId = dto.CategoryId;
        entity.SubCategoryId = dto.SubCategoryId;
        entity.Level = dto.Level;
        entity.IsActive = dto.IsActive;
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        var updated = await _repository.GetByIdAsync(id, cancellationToken);
        if (updated == null)
            return ApiResult<QuestionResponseDto>.Failure("Question not found after update.");
        return ApiResult<QuestionResponseDto>.Success(new QuestionResponseDto(updated.Id, updated.Title, updated.TitleAr, updated.Answer, updated.AnswerAr, updated.CategoryId, updated.SubCategoryId, updated.Level, updated.IsActive, updated.CreatedAt, updated.Category?.Name, updated.SubCategory?.Name));
    }

    public async Task<ApiResult<QuestionResponseDto>> ToggleStatusAsync(int id, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdForUpdateAsync(id, cancellationToken);
        if (entity == null)
            return ApiResult<QuestionResponseDto>.Failure("Question not found.");
        entity.IsActive = !entity.IsActive;
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        var updated = await _repository.GetByIdAsync(id, cancellationToken);
        if (updated == null)
            return ApiResult<QuestionResponseDto>.Failure("Question not found after update.");
        return ApiResult<QuestionResponseDto>.Success(new QuestionResponseDto(updated.Id, updated.Title, updated.TitleAr, updated.Answer, updated.AnswerAr, updated.CategoryId, updated.SubCategoryId, updated.Level, updated.IsActive, updated.CreatedAt, updated.Category?.Name, updated.SubCategory?.Name));
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
