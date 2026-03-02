using FluentValidation;

namespace Application.Features.Questions;

public class UpdateQuestionValidator : AbstractValidator<UpdateQuestionDto>
{
    public UpdateQuestionValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(2000);
        RuleFor(x => x.Answer).NotEmpty().MaximumLength(10000);
    }
}
