using Domian.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Configurations;

public class RefreshTokenConfiguration : IEntityTypeConfiguration<RefreshToken>
{
    public void Configure(EntityTypeBuilder<RefreshToken> builder)
    {
        builder.ToTable("RefreshTokens");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Id).UseIdentityColumn();
        builder.Property(e => e.Token).IsRequired().HasMaxLength(512);
        builder.HasIndex(e => e.Token);
        builder.HasIndex(e => e.UserId);
        builder.Property(e => e.ExpirationDate).IsRequired();
        builder.Property(e => e.IsRevoked).IsRequired().HasDefaultValue(false);
        builder.Property(e => e.UserId).IsRequired();
        builder.HasOne(e => e.User).WithMany(e => e.RefreshTokens).HasForeignKey(e => e.UserId).OnDelete(DeleteBehavior.Cascade);
    }
}
