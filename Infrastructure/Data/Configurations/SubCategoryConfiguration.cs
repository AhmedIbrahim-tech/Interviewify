using Domian.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Configurations;

public class SubCategoryConfiguration : IEntityTypeConfiguration<SubCategory>
{
    public void Configure(EntityTypeBuilder<SubCategory> builder)
    {
        builder.ToTable("SubCategories");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Id).UseIdentityColumn();
        builder.Property(e => e.Name).HasMaxLength(200).IsRequired();
        builder.Property(e => e.CategoryId).IsRequired();
        builder.HasIndex(e => e.CategoryId);
        builder.HasOne(e => e.Category).WithMany(e => e.SubCategories).HasForeignKey(e => e.CategoryId).OnDelete(DeleteBehavior.Restrict);
        builder.HasMany(e => e.Questions).WithOne(e => e.SubCategory).HasForeignKey(e => e.SubCategoryId).OnDelete(DeleteBehavior.Restrict);
    }
}
