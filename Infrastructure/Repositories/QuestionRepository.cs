using Application.Interfaces;
using Domian.Entities;
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

    public async Task<IReadOnlyList<Question>> GetBySubCategoryIdAsync(int subCategoryId, CancellationToken cancellationToken = default) =>
        await _context.Questions.Where(q => q.SubCategoryId == subCategoryId).OrderBy(q => q.CreatedAt).ToListAsync(cancellationToken);

    public async Task<Question?> GetByIdAsync(int id, CancellationToken cancellationToken = default) =>
        await _context.Questions.FindAsync(new object[] { id }, cancellationToken);

    public async Task AddAsync(Question entity, CancellationToken cancellationToken = default) =>
        await _context.Questions.AddAsync(entity, cancellationToken);

    public void Update(Question entity) => _context.Questions.Update(entity);

    public void Delete(Question entity) => _context.Questions.Remove(entity);
}
