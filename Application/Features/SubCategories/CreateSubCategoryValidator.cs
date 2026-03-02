using FluentValidation;

namespace Application.Features.SubCategories;

public class CreateSubCategoryValidator : AbstractValidator<CreateSubCategoryDto>
{
    public CreateSubCategoryValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.CategoryId).GreaterThan(0);
    }
}
