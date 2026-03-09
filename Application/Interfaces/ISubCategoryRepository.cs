using Domain.Entities;

namespace Application.Interfaces;

public interface ISubCategoryRepository
{
    Task<IReadOnlyList<SubCategory>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<SubCategory>> GetByCategoryIdAsync(int categoryId, CancellationToken cancellationToken = default);
    Task<SubCategory?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task AddAsync(SubCategory entity, CancellationToken cancellationToken = default);
    void Update(SubCategory entity);
    void Delete(SubCategory entity);
}
