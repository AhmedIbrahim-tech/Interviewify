using FluentValidation;

namespace Application.Features.SubCategories;

public class UpdateSubCategoryValidator : AbstractValidator<UpdateSubCategoryDto>
{
    public UpdateSubCategoryValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
    }
}
