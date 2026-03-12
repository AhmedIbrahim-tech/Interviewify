using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Configurations;

public class QuestionConfiguration : IEntityTypeConfiguration<Question>
{
    public void Configure(EntityTypeBuilder<Question> builder)
    {
        builder.ToTable("Questions");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Id).UseIdentityColumn();
        builder.Property(e => e.Title).HasMaxLength(2000).IsRequired();
        builder.Property(e => e.TitleAr).HasMaxLength(2000).IsRequired(false);
        builder.Property(e => e.Answer).HasMaxLength(10000).IsRequired();
        builder.Property(e => e.AnswerAr).HasMaxLength(10000).IsRequired(false);
        builder.Property(e => e.CategoryId).IsRequired();
        builder.Property(e => e.SubCategoryId).IsRequired();
        builder.Property(e => e.IsActive).IsRequired().HasDefaultValue(true);
        builder.Property(e => e.CreatedAt).IsRequired().HasDefaultValueSql("GETUTCDATE()");
        builder.HasIndex(e => e.SubCategoryId);
        builder.HasIndex(e => e.CategoryId);
        builder.HasOne(e => e.Category).WithMany().HasForeignKey(e => e.CategoryId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(e => e.SubCategory).WithMany(e => e.Questions).HasForeignKey(e => e.SubCategoryId).OnDelete(DeleteBehavior.Restrict);
    }
}
