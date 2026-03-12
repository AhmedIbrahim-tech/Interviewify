using Application.Interfaces;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class QuestionRepository : IQuestionRepository
{
    private readonly ApplicationDbContext _context;

    public QuestionRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<Question>> GetAllAsync(CancellationToken cancellationToken = default) =>
        await _context.Questions.AsNoTracking().Include(q => q.Category).Include(q => q.SubCategory).OrderByDescending(q => q.CreatedAt).ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<Question>> GetByCategoryIdAsync(int categoryId, CancellationToken cancellationToken = default) =>
        await _context.Questions.AsNoTracking().Include(q => q.Category).Include(q => q.SubCategory).Where(q => q.CategoryId == categoryId && q.IsActive).OrderBy(q => q.SubCategoryId).ThenBy(q => q.CreatedAt).ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<Question>> GetBySubCategoryIdAsync(int subCategoryId, CancellationToken cancellationToken = default) =>
        await _context.Questions.AsNoTracking().Include(q => q.Category).Include(q => q.SubCategory).Where(q => q.SubCategoryId == subCategoryId && q.IsActive).OrderBy(q => q.CreatedAt).ToListAsync(cancellationToken);

    public async Task<(IReadOnlyList<Question> Items, int TotalCount)> GetPagedAsync(
        int? categoryId,
        int? subCategoryId,
        QuestionLevel? level,
        bool? isActive,
        int page,
        int pageSize,
        string sortBy,
        bool sortDescending,
        CancellationToken cancellationToken = default)
    {
        var query = _context.Questions.AsNoTracking().Include(q => q.Category).Include(q => q.SubCategory).AsQueryable();
        if (categoryId.HasValue) query = query.Where(q => q.CategoryId == categoryId.Value);
        if (subCategoryId.HasValue) query = query.Where(q => q.SubCategoryId == subCategoryId.Value);
        if (level.HasValue) query = query.Where(q => q.Level == level.Value);
        if (isActive.HasValue) query = query.Where(q => q.IsActive == isActive.Value);

        var totalCount = await query.CountAsync(cancellationToken);

        query = sortBy?.ToLowerInvariant() switch
        {
            "title" => sortDescending ? query.OrderByDescending(q => q.Title) : query.OrderBy(q => q.Title),
            "level" => sortDescending ? query.OrderByDescending(q => q.Level) : query.OrderBy(q => q.Level),
            "createdat" => sortDescending ? query.OrderByDescending(q => q.CreatedAt) : query.OrderBy(q => q.CreatedAt),
            _ => sortDescending ? query.OrderByDescending(q => q.CreatedAt) : query.OrderBy(q => q.CreatedAt)
        };

        var items = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(cancellationToken);
        return (items, totalCount);
    }

    public async Task<Question?> GetByIdAsync(int id, CancellationToken cancellationToken = default) =>
        await _context.Questions.AsNoTracking().Include(q => q.Category).Include(q => q.SubCategory).FirstOrDefaultAsync(q => q.Id == id, cancellationToken);

    public async Task<Question?> GetByIdForUpdateAsync(int id, CancellationToken cancellationToken = default) =>
        await _context.Questions.Include(q => q.Category).Include(q => q.SubCategory).FirstOrDefaultAsync(q => q.Id == id, cancellationToken);

    public async Task AddAsync(Question entity, CancellationToken cancellationToken = default) =>
        await _context.Questions.AddAsync(entity, cancellationToken);

    public void Update(Question entity) => _context.Questions.Update(entity);

    public void Delete(Question entity) => _context.Questions.Remove(entity);
}
