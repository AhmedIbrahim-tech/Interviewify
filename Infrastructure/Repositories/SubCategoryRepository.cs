using Application.Interfaces;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class SubCategoryRepository : ISubCategoryRepository
{
    private readonly ApplicationDbContext _context;

    public SubCategoryRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<SubCategory>> GetAllAsync(CancellationToken cancellationToken = default) =>
        await _context.SubCategories.AsNoTracking().Include(s => s.Category).OrderBy(s => s.Name).ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<SubCategory>> GetByCategoryIdAsync(int categoryId, CancellationToken cancellationToken = default) =>
        await _context.SubCategories.AsNoTracking().Include(s => s.Category).Where(s => s.CategoryId == categoryId).OrderBy(s => s.Name).ToListAsync(cancellationToken);

    public async Task<SubCategory?> GetByIdAsync(int id, CancellationToken cancellationToken = default) =>
        await _context.SubCategories.AsNoTracking().Include(s => s.Category).FirstOrDefaultAsync(s => s.Id == id, cancellationToken);

    public async Task AddAsync(SubCategory entity, CancellationToken cancellationToken = default) =>
        await _context.SubCategories.AddAsync(entity, cancellationToken);

    public void Update(SubCategory entity) => _context.SubCategories.Update(entity);

    public void Delete(SubCategory entity) => _context.SubCategories.Remove(entity);
}
