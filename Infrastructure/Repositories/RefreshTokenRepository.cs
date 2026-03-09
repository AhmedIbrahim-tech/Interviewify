using Application.Interfaces;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class RefreshTokenRepository : IRefreshTokenRepository
{
    private readonly ApplicationDbContext _context;

    public RefreshTokenRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<RefreshToken?> GetByTokenAsync(string token, CancellationToken cancellationToken = default) =>
        await _context.RefreshTokens.Include(rt => rt.User).FirstOrDefaultAsync(rt => rt.Token == token, cancellationToken);

    public async Task AddAsync(RefreshToken entity, CancellationToken cancellationToken = default) =>
        await _context.RefreshTokens.AddAsync(entity, cancellationToken);

    public void Update(RefreshToken entity) => _context.RefreshTokens.Update(entity);
}
