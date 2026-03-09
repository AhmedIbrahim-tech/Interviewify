using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace Infrastructure.Data;

public static class DbSeeder
{
    public const string AdminEmail = "admin@interviewify.local";
    private const string TestUserEmail = "user@interviewify.local";

    public static async Task SeedAsync(IHost app)
    {
        using var scope = app.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        await context.Database.EnsureCreatedAsync();

        await SeedUsersAsync(context);
        await SeedCategoriesAsync(context);
        await SeedSubCategoriesAsync(context);
        await SeedQuestionsAsync(context);
    }

    private static async Task SeedUsersAsync(ApplicationDbContext context)
    {
        var hasAdmin = await context.Users.AnyAsync(u => u.Email == AdminEmail);
        if (hasAdmin) return;

        var hash = BCrypt.Net.BCrypt.HashPassword("Admin@123");
        var admin = new User
        {
            FullName = "Ahmed Eprahim",
            Email = AdminEmail,
            PasswordHash = hash,
            Role = Role.Admin,
            Status = UserStatus.Active
        };
        context.Users.Add(admin);

        var testUserHash = BCrypt.Net.BCrypt.HashPassword("User@123");
        var testUser = new User
        {
            FullName = "Test User",
            Email = TestUserEmail,
            PasswordHash = testUserHash,
            Role = Role.User,
            Status = UserStatus.Active
        };
        context.Users.Add(testUser);

        await context.SaveChangesAsync();
    }

    private static async Task SeedCategoriesAsync(ApplicationDbContext context)
    {
        if (await context.Categories.AnyAsync()) return;

        var categories = new[]
        {
            new Category { Name = "C#", IsActive = true },
            new Category { Name = "ASP.NET Core", IsActive = true },
            new Category { Name = "Entity Framework", IsActive = true },
            new Category { Name = "SQL & Database", IsActive = true },
            new Category { Name = "JavaScript & Frontend", IsActive = true },
            new Category { Name = "System Design & Architecture", IsActive = true }
        };
        context.Categories.AddRange(categories);
        await context.SaveChangesAsync();
    }

    private static async Task SeedSubCategoriesAsync(ApplicationDbContext context)
    {
        if (await context.SubCategories.AnyAsync()) return;

        var categories = await context.Categories.ToListAsync();
        var categoryByName = categories.ToDictionary(c => c.Name, c => c.Id);

        var subCategories = new List<SubCategory>();

        if (categoryByName.TryGetValue("C#", out var csharpId))
        {
            subCategories.AddRange(new[]
            {
                new SubCategory { Name = "Language Basics", CategoryId = csharpId },
                new SubCategory { Name = "OOP & Design Patterns", CategoryId = csharpId },
                new SubCategory { Name = "LINQ & Collections", CategoryId = csharpId },
                new SubCategory { Name = "Async/Await & Threading", CategoryId = csharpId }
            });
        }

        if (categoryByName.TryGetValue("ASP.NET Core", out var aspNetId))
        {
            subCategories.AddRange(new[]
            {
                new SubCategory { Name = "MVC & Controllers", CategoryId = aspNetId },
                new SubCategory { Name = "Middleware & Pipeline", CategoryId = aspNetId },
                new SubCategory { Name = "Dependency Injection", CategoryId = aspNetId },
                new SubCategory { Name = "Authentication & Authorization", CategoryId = aspNetId }
            });
        }

        if (categoryByName.TryGetValue("Entity Framework", out var efId))
        {
            subCategories.AddRange(new[]
            {
                new SubCategory { Name = "EF Core Basics", CategoryId = efId },
                new SubCategory { Name = "Migrations & Schema", CategoryId = efId },
                new SubCategory { Name = "Query Performance", CategoryId = efId }
            });
        }

        if (categoryByName.TryGetValue("SQL & Database", out var sqlId))
        {
            subCategories.AddRange(new[]
            {
                new SubCategory { Name = "T-SQL Queries", CategoryId = sqlId },
                new SubCategory { Name = "Indexes & Optimization", CategoryId = sqlId },
                new SubCategory { Name = "Transactions", CategoryId = sqlId }
            });
        }

        if (categoryByName.TryGetValue("JavaScript & Frontend", out var jsId))
        {
            subCategories.AddRange(new[]
            {
                new SubCategory { Name = "JavaScript Fundamentals", CategoryId = jsId },
                new SubCategory { Name = "React", CategoryId = jsId },
                new SubCategory { Name = "TypeScript", CategoryId = jsId }
            });
        }

        if (categoryByName.TryGetValue("System Design & Architecture", out var archId))
        {
            subCategories.AddRange(new[]
            {
                new SubCategory { Name = "Clean Architecture", CategoryId = archId },
                new SubCategory { Name = "Microservices", CategoryId = archId },
                new SubCategory { Name = "CQRS & Event Sourcing", CategoryId = archId }
            });
        }

        context.SubCategories.AddRange(subCategories);
        await context.SaveChangesAsync();
    }

    private static async Task SeedQuestionsAsync(ApplicationDbContext context)
    {
        if (await context.Questions.AnyAsync()) return;

        var subCategories = await context.SubCategories.Include(s => s.Category).ToListAsync();
        var subByNameAndCategory = subCategories
            .GroupBy(s => s.Category?.Name ?? "")
            .ToDictionary(g => g.Key, g => g.ToDictionary(s => s.Name, s => s));

        var questions = new List<Question>();
        var now = DateTime.UtcNow;

        SeedQuestion(questions, subByNameAndCategory, "C#", "Language Basics",
            "What is the difference between value types and reference types in C#?",
            "Value types (struct, enum, primitives) are stored on the stack and hold the data directly. Reference types (class, interface, delegate) are stored on the heap and variables hold a reference. Value types are copied by value; reference types copy the reference.");
        SeedQuestion(questions, subByNameAndCategory, "C#", "Language Basics",
            "Explain the difference between var, object, and dynamic.",
            "var is compile-time type inference. object is the base type that can hold any reference type via boxing. dynamic defers type resolution to runtime and allows late binding.");
        SeedQuestion(questions, subByNameAndCategory, "C#", "OOP & Design Patterns",
            "What are the SOLID principles?",
            "Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion. They guide design for maintainable and testable code.");
        SeedQuestion(questions, subByNameAndCategory, "C#", "Async/Await & Threading",
            "What is the difference between Task.Run and async/await?",
            "Task.Run offloads work to a thread-pool thread. async/await is for I/O-bound work and releases the thread while waiting. Use async/await for I/O; Task.Run only when you need to offload CPU-bound work.");
        SeedQuestion(questions, subByNameAndCategory, "ASP.NET Core", "Middleware & Pipeline",
            "What is the request pipeline and how does middleware work?",
            "The pipeline is a sequence of middleware components. Each can handle the request, call the next middleware, or short-circuit. Order matters; they run in the order they are registered.");
        SeedQuestion(questions, subByNameAndCategory, "ASP.NET Core", "Dependency Injection",
            "Describe the built-in DI service lifetimes in ASP.NET Core.",
            "Transient: new instance per request. Scoped: one per scope (e.g. per HTTP request). Singleton: single instance for the app lifetime.");
        SeedQuestion(questions, subByNameAndCategory, "Entity Framework", "EF Core Basics",
            "What is the difference between IQueryable and IEnumerable in EF Core?",
            "IQueryable builds expressions that are translated to SQL and executed on the server. IEnumerable runs in memory. Use IQueryable for database queries to avoid loading entire tables.");
        SeedQuestion(questions, subByNameAndCategory, "SQL & Database", "T-SQL Queries",
            "What is the difference between INNER JOIN and LEFT JOIN?",
            "INNER JOIN returns only matching rows from both tables. LEFT JOIN returns all rows from the left table and matching rows from the right; non-matches get NULL on the right.");
        SeedQuestion(questions, subByNameAndCategory, "JavaScript & Frontend", "JavaScript Fundamentals",
            "Explain the event loop and how async code runs in JavaScript.",
            "The event loop processes the call stack, then the microtask queue (e.g. Promises), then the macrotask queue (e.g. setTimeout). This allows non-blocking I/O and concurrent execution.");
        SeedQuestion(questions, subByNameAndCategory, "System Design & Architecture", "Clean Architecture",
            "What are the main layers in Clean Architecture?",
            "Domain (entities, no dependencies), Application (use cases, interfaces), Infrastructure (implementations, DB, external APIs), and Presentation (UI or API). Dependencies point inward toward the domain.");

        foreach (var q in questions)
            q.CreatedAt = now;

        context.Questions.AddRange(questions);
        await context.SaveChangesAsync();
    }

    private static void SeedQuestion(
        List<Question> list,
        Dictionary<string, Dictionary<string, SubCategory>> subByNameAndCategory,
        string categoryName,
        string subCategoryName,
        string title,
        string answer)
    {
        if (!subByNameAndCategory.TryGetValue(categoryName, out var subs) ||
            !subs.TryGetValue(subCategoryName, out var sub))
            return;

        list.Add(new Question
        {
            Title = title,
            Answer = answer,
            CategoryId = sub.CategoryId,
            SubCategoryId = sub.Id,
            IsActive = true
        });
    }
}
