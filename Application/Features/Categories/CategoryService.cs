using Application.Common;
using Application.Features.SubCategories;
using Application.Interfaces;
using Domain.Entities;

namespace Application.Features.Categories;

public class CategoryService : ICategoryService
{
    private readonly ICategoryRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public CategoryService(ICategoryRepository repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResult<IReadOnlyList<CategoryResponseDto>>> GetAllAsync(bool activeOnly = false, CancellationToken cancellationToken = default)
    {
        var list = await _repository.GetAllAsync(activeOnly, cancellationToken);
        var dtos = list.Select(e => new CategoryResponseDto(
            e.Id, 
            e.Name, 
            e.Description, 
            e.IsActive, 
            e.SubCategories.Select(s => new SubCategoryResponseDto(s.Id, s.Name, s.CategoryId)).ToList()
        )).ToList();
        return ApiResult<IReadOnlyList<CategoryResponseDto>>.Success(dtos);
    }

    public async Task<ApiResult<CategoryResponseDto?>> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var e = await _repository.GetByIdAsync(id, cancellationToken);
        if (e == null)
            return ApiResult<CategoryResponseDto?>.Failure("Category not found.");
        
        var dto = new CategoryResponseDto(
            e.Id, 
            e.Name, 
            e.Description, 
            e.IsActive, 
            e.SubCategories.Select(s => new SubCategoryResponseDto(s.Id, s.Name, s.CategoryId)).ToList()
        );
        return ApiResult<CategoryResponseDto?>.Success(dto);
    }

    public async Task<ApiResult<CategoryResponseDto>> CreateAsync(CreateCategoryDto dto, CancellationToken cancellationToken = default)
    {
        var entity = new Category { Name = dto.Name, Description = dto.Description, IsActive = dto.IsActive };
        await _repository.AddAsync(entity, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return ApiResult<CategoryResponseDto>.Success(new CategoryResponseDto(
            entity.Id, entity.Name, entity.Description, entity.IsActive, new List<SubCategoryResponseDto>()));
    }

    public async Task<ApiResult<CategoryResponseDto>> UpdateAsync(int id, UpdateCategoryDto dto, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(id, cancellationToken);
        if (entity == null)
            return ApiResult<CategoryResponseDto>.Failure("Category not found.");
        
        entity.Name = dto.Name;
        entity.Description = dto.Description;
        entity.IsActive = dto.IsActive;
        
        _repository.Update(entity);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        
        return ApiResult<CategoryResponseDto>.Success(new CategoryResponseDto(
            entity.Id, entity.Name, entity.Description, entity.IsActive, 
            entity.SubCategories.Select(s => new SubCategoryResponseDto(s.Id, s.Name, s.CategoryId)).ToList()));
    }

    public async Task<ApiResult<bool>> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(id, cancellationToken);
        if (entity == null)
            return ApiResult<bool>.Failure("Category not found.");

        if (entity.SubCategories.Any())
        {
            return ApiResult<bool>.Failure("Cannot delete this category because it contains associated subcategories.");
        }
        
        _repository.Delete(entity);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return ApiResult<bool>.Success(true);
    }
}
