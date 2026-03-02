using Application.Interfaces;
using Domian.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class UserRepository : IUserRepository
{
    private readonly ApplicationDbContext _context;

    public UserRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<User>> GetAllAsync(CancellationToken cancellationToken = default) =>
        await _context.Users.OrderBy(u => u.FullName).ToListAsync(cancellationToken);

    public async Task<User?> GetByIdAsync(int id, CancellationToken cancellationToken = default) =>
        await _context.Users.FindAsync(new object[] { id }, cancellationToken);

    public async Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default) =>
        await _context.Users.FirstOrDefaultAsync(u => u.Email == email, cancellationToken);

    public async Task AddAsync(User entity, CancellationToken cancellationToken = default) =>
        await _context.Users.AddAsync(entity, cancellationToken);

    public void Update(User entity) => _context.Users.Update(entity);

    public void Delete(User entity) => _context.Users.Remove(entity);
}
