using Application.Common;
using Application.Interfaces;
using Domain.Entities;

namespace Application.Features.SubCategories;

public class SubCategoryService : ISubCategoryService
{
    private readonly ISubCategoryRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public SubCategoryService(ISubCategoryRepository repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResult<IReadOnlyList<SubCategoryResponseDto>>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var list = await _repository.GetAllAsync(cancellationToken);
        var dtos = list.Select(e => new SubCategoryResponseDto(e.Id, e.Name, e.CategoryId, e.DisplayOrder, e.Category?.Name)).ToList();
        return ApiResult<IReadOnlyList<SubCategoryResponseDto>>.Success(dtos);
    }

    public async Task<ApiResult<IReadOnlyList<SubCategoryResponseDto>>> GetByCategoryIdAsync(int categoryId, CancellationToken cancellationToken = default)
    {
        var list = await _repository.GetByCategoryIdAsync(categoryId, cancellationToken);
        var dtos = list.Select(e => new SubCategoryResponseDto(e.Id, e.Name, e.CategoryId, e.DisplayOrder, e.Category?.Name)).ToList();
        return ApiResult<IReadOnlyList<SubCategoryResponseDto>>.Success(dtos);
    }

    public async Task<ApiResult<SubCategoryResponseDto>> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var e = await _repository.GetByIdAsync(id, cancellationToken);
        if (e == null) return ApiResult<SubCategoryResponseDto>.Failure("SubCategory not found.");
        return ApiResult<SubCategoryResponseDto>.Success(new SubCategoryResponseDto(e.Id, e.Name, e.CategoryId, e.DisplayOrder, e.Category?.Name));
    }

    public async Task<ApiResult<SubCategoryResponseDto>> CreateAsync(CreateSubCategoryDto dto, CancellationToken cancellationToken = default)
    {
        var entity = new SubCategory { Name = dto.Name, CategoryId = dto.CategoryId, DisplayOrder = dto.DisplayOrder };
        await _repository.AddAsync(entity, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return ApiResult<SubCategoryResponseDto>.Success(new SubCategoryResponseDto(entity.Id, entity.Name, entity.CategoryId, entity.DisplayOrder));
    }

    public async Task<ApiResult<SubCategoryResponseDto>> UpdateAsync(int id, UpdateSubCategoryDto dto, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(id, cancellationToken);
        if (entity == null)
            return ApiResult<SubCategoryResponseDto>.Failure("SubCategory not found.");
        entity.Name = dto.Name;
        entity.DisplayOrder = dto.DisplayOrder;
        _repository.Update(entity);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return ApiResult<SubCategoryResponseDto>.Success(new SubCategoryResponseDto(entity.Id, entity.Name, entity.CategoryId, entity.DisplayOrder));
    }

    public async Task<ApiResult<bool>> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(id, cancellationToken);
        if (entity == null)
            return ApiResult<bool>.Failure("SubCategory not found.");
        _repository.Delete(entity);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return ApiResult<bool>.Success(true);
    }
}
