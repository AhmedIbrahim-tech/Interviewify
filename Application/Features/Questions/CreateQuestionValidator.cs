using FluentValidation;

namespace Application.Features.Questions;

public class CreateQuestionValidator : AbstractValidator<CreateQuestionDto>
{
    public CreateQuestionValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(2000);
        RuleFor(x => x.Answer).NotEmpty().MaximumLength(10000);
        RuleFor(x => x.CategoryId).GreaterThan(0);
        RuleFor(x => x.SubCategoryId).GreaterThan(0);
    }
}
