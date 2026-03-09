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

    public async Task<Question?> GetByIdAsync(int id, CancellationToken cancellationToken = default) =>
        await _context.Questions.AsNoTracking().Include(q => q.Category).Include(q => q.SubCategory).FirstOrDefaultAsync(q => q.Id == id, cancellationToken);

    public async Task AddAsync(Question entity, CancellationToken cancellationToken = default) =>
        await _context.Questions.AddAsync(entity, cancellationToken);

    public void Update(Question entity) => _context.Questions.Update(entity);

    public void Delete(Question entity) => _context.Questions.Remove(entity);
}
