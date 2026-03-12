using Domain.Entities;

namespace Application.Interfaces;

public interface IQuestionRepository
{
    Task<IReadOnlyList<Question>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Question>> GetByCategoryIdAsync(int categoryId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Question>> GetBySubCategoryIdAsync(int subCategoryId, CancellationToken cancellationToken = default);
    Task<(IReadOnlyList<Question> Items, int TotalCount)> GetPagedAsync(
        int? categoryId,
        int? subCategoryId,
        QuestionLevel? level,
        bool? isActive,
        int page,
        int pageSize,
        string sortBy,
        bool sortDescending,
        CancellationToken cancellationToken = default);
    Task<Question?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<Question?> GetByIdForUpdateAsync(int id, CancellationToken cancellationToken = default);
    Task AddAsync(Question entity, CancellationToken cancellationToken = default);
    void Update(Question entity);
    void Delete(Question entity);
}
