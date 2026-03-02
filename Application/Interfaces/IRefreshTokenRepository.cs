using Domian.Entities;

namespace Application.Interfaces;

public interface IRefreshTokenRepository
{
    Task<RefreshToken?> GetByTokenAsync(string token, CancellationToken cancellationToken = default);
    Task AddAsync(RefreshToken entity, CancellationToken cancellationToken = default);
    void Update(RefreshToken entity);
}
