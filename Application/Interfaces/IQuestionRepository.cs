using Domian.Entities;

namespace Application.Interfaces;

public interface IQuestionRepository
{
    Task<IReadOnlyList<Question>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Question>> GetBySubCategoryIdAsync(int subCategoryId, CancellationToken cancellationToken = default);
    Task<Question?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task AddAsync(Question entity, CancellationToken cancellationToken = default);
    void Update(Question entity);
    void Delete(Question entity);
}
