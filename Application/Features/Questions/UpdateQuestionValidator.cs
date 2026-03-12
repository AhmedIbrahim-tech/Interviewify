using Domain.Entities;
using FluentValidation;

namespace Application.Features.Questions;

public class UpdateQuestionValidator : AbstractValidator<UpdateQuestionDto>
{
    public UpdateQuestionValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(2000);
        RuleFor(x => x.TitleAr).MaximumLength(2000).When(x => x.TitleAr != null);
        RuleFor(x => x.Answer).MaximumLength(10000).When(x => x.Answer != null);
        RuleFor(x => x.AnswerAr).MaximumLength(10000).When(x => x.AnswerAr != null);
        RuleFor(x => x.CategoryId).GreaterThan(0);
        RuleFor(x => x.SubCategoryId).GreaterThan(0);
        RuleFor(x => x.Level).IsInEnum();
    }
}
