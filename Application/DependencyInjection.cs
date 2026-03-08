using Application.Features.Auth;
using Application.Features.Categories;
using Application.Features.Questions;
using Application.Features.SubCategories;
using Application.Features.Lookups;
using Application.Features.Users;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using Application.Interfaces;

namespace Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<ICategoryService, CategoryService>();
        services.AddScoped<ISubCategoryService, SubCategoryService>();
        services.AddScoped<IQuestionService, QuestionService>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IUserService, UserService>();
        services.AddScoped<ILookupService, LookupService>();

        services.AddValidatorsFromAssemblyContaining<CreateCategoryValidator>();
        return services;
    }
}
