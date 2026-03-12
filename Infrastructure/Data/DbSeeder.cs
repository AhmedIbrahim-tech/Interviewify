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
            "Value types (struct, enum, primitives) are stored on the stack and hold the data directly. Reference types (class, interface, delegate) are stored on the heap and variables hold a reference. Value types are copied by value; reference types copy the reference.",
            "ما الفرق بين أنواع القيمة وأنواع المراجع في C#؟");
        SeedQuestion(questions, subByNameAndCategory, "C#", "Language Basics",
            "Explain the difference between var, object, and dynamic.",
            "var is compile-time type inference. object is the base type that can hold any reference type via boxing. dynamic defers type resolution to runtime and allows late binding.",
            "اشرح الفرق بين var و object و dynamic.");
        SeedQuestion(questions, subByNameAndCategory, "C#", "OOP & Design Patterns",
            "What are the SOLID principles?",
            "Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion. They guide design for maintainable and testable code.",
            "ما مبادئ SOLID؟");
        SeedQuestion(questions, subByNameAndCategory, "C#", "Async/Await & Threading",
            "What is the difference between Task.Run and async/await?",
            "Task.Run offloads work to a thread-pool thread. async/await is for I/O-bound work and releases the thread while waiting. Use async/await for I/O; Task.Run only when you need to offload CPU-bound work.",
            "ما الفرق بين Task.Run و async/await؟");
        SeedQuestion(questions, subByNameAndCategory, "ASP.NET Core", "Middleware & Pipeline",
            "What is the request pipeline and how does middleware work?",
            "The pipeline is a sequence of middleware components. Each can handle the request, call the next middleware, or short-circuit. Order matters; they run in the order they are registered.",
            "ما خط أنابيب الطلب وكيف يعمل الـ Middleware؟");
        SeedQuestion(questions, subByNameAndCategory, "ASP.NET Core", "Dependency Injection",
            "Describe the built-in DI service lifetimes in ASP.NET Core.",
            "Transient: new instance per request. Scoped: one per scope (e.g. per HTTP request). Singleton: single instance for the app lifetime.",
            "صف فترات حياة خدمات DI المدمجة في ASP.NET Core.");
        SeedQuestion(questions, subByNameAndCategory, "Entity Framework", "EF Core Basics",
            "What is the difference between IQueryable and IEnumerable in EF Core?",
            "IQueryable builds expressions that are translated to SQL and executed on the server. IEnumerable runs in memory. Use IQueryable for database queries to avoid loading entire tables.",
            "ما الفرق بين IQueryable و IEnumerable في EF Core؟");
        SeedQuestion(questions, subByNameAndCategory, "SQL & Database", "T-SQL Queries",
            "What is the difference between INNER JOIN and LEFT JOIN?",
            "INNER JOIN returns only matching rows from both tables. LEFT JOIN returns all rows from the left table and matching rows from the right; non-matches get NULL on the right.",
            "ما الفرق بين INNER JOIN و LEFT JOIN؟");
        SeedQuestion(questions, subByNameAndCategory, "JavaScript & Frontend", "JavaScript Fundamentals",
            "Explain the event loop and how async code runs in JavaScript.",
            "The event loop processes the call stack, then the microtask queue (e.g. Promises), then the macrotask queue (e.g. setTimeout). This allows non-blocking I/O and concurrent execution.",
            "اشرح حلقة الأحداث وكيف يعمل الكود غير المتزامن في JavaScript.");
        SeedQuestion(questions, subByNameAndCategory, "System Design & Architecture", "Clean Architecture",
            "What are the main layers in Clean Architecture?",
            "Domain (entities, no dependencies), Application (use cases, interfaces), Infrastructure (implementations, DB, external APIs), and Presentation (UI or API). Dependencies point inward toward the domain.",
            "ما الطبقات الرئيسية في الهندسة النظيفة؟");

        // C# – Language Basics (more)
        SeedQuestion(questions, subByNameAndCategory, "C#", "Language Basics",
            "What is boxing and unboxing?",
            "Boxing is converting a value type to a reference type (object); the value is copied to the heap. Unboxing is the reverse; the value is copied back to the stack. Both have performance cost.",
            "ما الـ Boxing والـ Unboxing؟", QuestionLevel.Fresh);
        SeedQuestion(questions, subByNameAndCategory, "C#", "Language Basics",
            "Explain nullable value types (e.g. int?).",
            "Nullable<T> wraps a value type to allow null. int? is shorthand for Nullable<int>. Use .HasValue and .Value, or null-coalescing (??) to handle nulls.",
            "اشرح أنواع القيمة القابلة للإلغاء (مثل int؟).");
        SeedQuestion(questions, subByNameAndCategory, "C#", "Language Basics",
            "What are string interpolation and verbatim strings?",
            "Interpolation: $\"Hello {name}\" embeds expressions. Verbatim: @\"C:\\path\" treats backslashes literally and allows multiline without escape sequences.",
            "ما تداخل النصوص والسلاسل الحرفية؟");
        SeedQuestion(questions, subByNameAndCategory, "C#", "Language Basics",
            "What is the difference between == and Equals()?",
            "== is operator overloadable; for reference types it compares references by default. Equals() is overridable for value equality. Use Equals() for semantic equality; override GetHashCode() when you override Equals().",
            "ما الفرق بين == و Equals()؟", QuestionLevel.Junior);
        SeedQuestion(questions, subByNameAndCategory, "C#", "Language Basics",
            "What are pattern matching and switch expressions (C# 8+)?",
            "Pattern matching lets you match on type, property, or condition. Switch expressions return a value (e.g. x switch { 1 => \"one\", _ => \"other\" }) and are more concise than switch statements.",
            "ما التطابق النمطي وتعابير switch في C# 8+؟", QuestionLevel.MidLevel);

        // C# – OOP & Design Patterns (more)
        SeedQuestion(questions, subByNameAndCategory, "C#", "OOP & Design Patterns",
            "Explain encapsulation, inheritance, and polymorphism in C#.",
            "Encapsulation: hide internals with private/protected. Inheritance: derive from a base class. Polymorphism: override methods so the runtime type determines which implementation runs.",
            "اشرح التغليف والميراث وتعدد الأشكال في C#.");
        SeedQuestion(questions, subByNameAndCategory, "C#", "OOP & Design Patterns",
            "What is the difference between abstract class and interface?",
            "Abstract class can have implementation, constructors, and state; single inheritance. Interface is a contract only (until default interface members); multiple inheritance. Prefer interface for flexibility.",
            "ما الفرق بين الكلاس المجرد والواجهة؟", QuestionLevel.Junior);
        SeedQuestion(questions, subByNameAndCategory, "C#", "OOP & Design Patterns",
            "Describe the Repository and Unit of Work patterns.",
            "Repository abstracts data access behind a collection-like API. Unit of Work groups multiple operations into one transaction and one SaveChanges, keeping consistency.",
            "صف نمطي Repository و Unit of Work.", QuestionLevel.MidLevel);
        SeedQuestion(questions, subByNameAndCategory, "C#", "OOP & Design Patterns",
            "What is the Factory pattern and when would you use it?",
            "Factory (or Factory Method) delegates object creation to a dedicated method or type. Use when construction is complex, or you need to return different implementations based on context.",
            "ما نمط المصنع ومتى تستخدمه؟", QuestionLevel.MidLevel);
        SeedQuestion(questions, subByNameAndCategory, "C#", "OOP & Design Patterns",
            "Explain dependency injection and constructor injection.",
            "DI provides dependencies from the outside instead of creating them inside the class. Constructor injection passes dependencies via the constructor; the container resolves and injects them. This improves testability and loose coupling.",
            "اشرح حقن التبعيات وحقن المنشئ.", QuestionLevel.Senior);

        // C# – LINQ & Collections
        SeedQuestion(questions, subByNameAndCategory, "C#", "LINQ & Collections",
            "What is LINQ and what are deferred execution and immediate execution?",
            "LINQ is a set of query operators (Where, Select, etc.). Deferred execution: the query runs when you enumerate (e.g. foreach or .ToList()). Immediate: runs when called (e.g. Count(), ToList()).",
            "ما LINQ وما التنفيذ المؤجل والتنفيذ الفوري؟", QuestionLevel.Junior);
        SeedQuestion(questions, subByNameAndCategory, "C#", "LINQ & Collections",
            "Explain the difference between IEnumerable and ICollection and IList.",
            "IEnumerable: read-only forward iteration. ICollection: add Count, Add/Remove (mutable). IList: indexer, Insert, RemoveAt. Choose by whether you need indexing and mutation.",
            "اشرح الفرق بين IEnumerable و ICollection و IList.");
        SeedQuestion(questions, subByNameAndCategory, "C#", "LINQ & Collections",
            "When would you use Dictionary vs List?",
            "Dictionary: O(1) lookup by key when you need key-value pairs. List: ordered, index-based access, good for sequences. Use Dictionary for lookups by ID or key; List for ordered collections.",
            "متى تستخدم Dictionary ومتى List؟");
        SeedQuestion(questions, subByNameAndCategory, "C#", "LINQ & Collections",
            "What is the difference between Select and SelectMany?",
            "Select projects one element to one result. SelectMany projects one element to a collection and flattens the result (e.g. list of orders to list of order items).",
            "ما الفرق بين Select و SelectMany؟", QuestionLevel.MidLevel);

        // C# – Async/Await & Threading (more)
        SeedQuestion(questions, subByNameAndCategory, "C#", "Async/Await & Threading",
            "What is ConfigureAwait(false) and when should you use it?",
            "ConfigureAwait(false) avoids capturing the SynchronizationContext when resuming after await. Use in library code to avoid deadlocks and improve performance when you don't need to marshal back to the original context.",
            "ما ConfigureAwait(false) ومتى تستخدمه؟", QuestionLevel.MidLevel);
        SeedQuestion(questions, subByNameAndCategory, "C#", "Async/Await & Threading",
            "Explain lock, Monitor, and SemaphoreSlim.",
            "lock is syntactic sugar for Monitor.Enter/Exit; one thread at a time. SemaphoreSlim allows N concurrent threads. Use lock for simple mutual exclusion; SemaphoreSlim for limiting concurrency.",
            "اشرح lock و Monitor و SemaphoreSlim.", QuestionLevel.Senior);
        SeedQuestion(questions, subByNameAndCategory, "C#", "Async/Await & Threading",
            "What is a deadlock and how can you avoid it?",
            "Deadlock: two or more threads wait for each other's locks. Avoid by locking in a consistent order, using timeouts, or avoiding nested locks. Prefer async over blocking locks where possible.",
            "ما التوقف التعادلي وكيف تتجنبه؟", QuestionLevel.Senior);

        // ASP.NET Core – MVC & Controllers
        SeedQuestion(questions, subByNameAndCategory, "ASP.NET Core", "MVC & Controllers",
            "What is the difference between ActionResult and IActionResult?",
            "IActionResult is the interface; ActionResult is a concrete implementation. Controllers typically return IActionResult to allow returning different result types (Ok, NotFound, View, etc.).",
            "ما الفرق بين ActionResult و IActionResult؟");
        SeedQuestion(questions, subByNameAndCategory, "ASP.NET Core", "MVC & Controllers",
            "Explain model binding and validation in ASP.NET Core.",
            "Model binding maps request data (route, query, body) to action parameters. Validation uses DataAnnotations or FluentValidation; ModelState.IsValid is checked before processing. Invalid requests return 400 with errors.",
            "اشرح ربط النماذج والتحقق في ASP.NET Core.", QuestionLevel.Junior);
        SeedQuestion(questions, subByNameAndCategory, "ASP.NET Core", "MVC & Controllers",
            "What are API versioning strategies?",
            "URL path (e.g. /api/v1/), query string (?version=1), or header (Api-Version). Use consistent strategy; URL path is common for REST. ASP.NET Core has optional versioning middleware.",
            "ما استراتيجيات إصدارات الـ API؟", QuestionLevel.MidLevel);
        SeedQuestion(questions, subByNameAndCategory, "ASP.NET Core", "MVC & Controllers",
            "How do you implement global exception handling in ASP.NET Core?",
            "Use middleware (e.g. custom exception handler) or IExceptionFilter. Prefer middleware that catches exceptions, logs, and returns a consistent error response. Use IExceptionHandler in .NET 8+.",
            "كيف تنفذ معالجة الاستثناءات العامة في ASP.NET Core؟", QuestionLevel.Senior);

        // ASP.NET Core – Middleware & Pipeline (more)
        SeedQuestion(questions, subByNameAndCategory, "ASP.NET Core", "Middleware & Pipeline",
            "What is the order of middleware that you should typically use?",
            "Exception handling first, then HTTPS redirect, static files, routing, CORS, authentication, authorization, then custom middleware, then endpoints. Order affects behavior (e.g. auth before endpoints).",
            "ما ترتيب الـ Middleware الذي يجب استخدامه عادة؟");
        SeedQuestion(questions, subByNameAndCategory, "ASP.NET Core", "Middleware & Pipeline",
            "How would you create custom middleware?",
            "Implement a class with InvokeAsync(HttpContext, RequestDelegate) or use app.Use(async (context, next) => { ... await next(); }). Register with app.UseMiddleware<T>() or app.Use().",
            "كيف تنشئ Middleware مخصصًا؟", QuestionLevel.MidLevel);

        // ASP.NET Core – Dependency Injection (more)
        SeedQuestion(questions, subByNameAndCategory, "ASP.NET Core", "Dependency Injection",
            "When would you use Transient vs Scoped vs Singleton?",
            "Transient: stateless, cheap services. Scoped: per-request state (e.g. DbContext). Singleton: shared state, caches, app-wide config. Never inject Scoped into Singleton (captured dependency).",
            "متى تستخدم Transient ومتى Scoped ومتى Singleton؟", QuestionLevel.MidLevel);
        SeedQuestion(questions, subByNameAndCategory, "ASP.NET Core", "Dependency Injection",
            "What is the difference between AddDbContext and AddDbContextPool?",
            "AddDbContext creates a new DbContext per scope. AddDbContextPool reuses context instances from a pool, reducing allocation. Use pool for high-throughput scenarios; be aware of state that must not leak between requests.",
            "ما الفرق بين AddDbContext و AddDbContextPool؟", QuestionLevel.Senior);

        // ASP.NET Core – Authentication & Authorization
        SeedQuestion(questions, subByNameAndCategory, "ASP.NET Core", "Authentication & Authorization",
            "What is the difference between authentication and authorization?",
            "Authentication: who you are (identity). Authorization: what you are allowed to do (permissions). Middleware order: UseAuthentication then UseAuthorization; both required for [Authorize].",
            "ما الفرق بين المصادقة والتفويض؟", QuestionLevel.Junior);
        SeedQuestion(questions, subByNameAndCategory, "ASP.NET Core", "Authentication & Authorization",
            "Explain JWT bearer authentication flow.",
            "Client sends credentials; server validates and returns a JWT. Client sends the token in the Authorization header. Server validates signature and claims. Use AddJwtBearer() and [Authorize] for protected endpoints.",
            "اشرح تدفق مصادقة JWT Bearer.", QuestionLevel.MidLevel);
        SeedQuestion(questions, subByNameAndCategory, "ASP.NET Core", "Authentication & Authorization",
            "What are policy-based authorization and requirement handlers?",
            "Policies define rules (e.g. MustHaveRole). Requirements represent a check; handlers implement IAuthorizationHandler to evaluate them. Register policies in AddAuthorization; apply with [Authorize(Policy = \"Name\")].",
            "ما التفويض القائم على السياسات ومعالجات المتطلبات؟", QuestionLevel.Senior);

        // Entity Framework – EF Core Basics (more)
        SeedQuestion(questions, subByNameAndCategory, "Entity Framework", "EF Core Basics",
            "What is change tracking and when is it used?",
            "Change tracking keeps track of loaded entities and their modifications. SaveChanges persists those changes. Use AsNoTracking() for read-only queries to improve performance and avoid unintended updates.",
            "ما تتبع التغييرات ومتى يُستخدم؟");
        SeedQuestion(questions, subByNameAndCategory, "Entity Framework", "EF Core Basics",
            "Explain eager loading, explicit loading, and lazy loading.",
            "Eager: Include() loads related data in the same query. Explicit: context.Entry(entity).Collection(x => x.Items).Load() loads when you request. Lazy: load on first access (requires proxy or lazy-loading setup). Prefer explicit Include for predictable queries.",
            "اشرح التحميل الشره والصريح والكسلان.", QuestionLevel.MidLevel);
        SeedQuestion(questions, subByNameAndCategory, "Entity Framework", "EF Core Basics",
            "What is the N+1 query problem and how do you fix it?",
            "N+1: one query for the list plus one query per item for a navigation property. Fix with Include() for collections or a single projected query that loads the needed data.",
            "ما مشكلة استعلام N+1 وكيف تحلها؟", QuestionLevel.MidLevel);

        // Entity Framework – Migrations & Schema
        SeedQuestion(questions, subByNameAndCategory, "Entity Framework", "Migrations & Schema",
            "What are EF Core migrations and how do you add one?",
            "Migrations are versioned schema changes. Add: dotnet ef migrations add <Name>. Apply: dotnet ef database update. Migrations generate Up/Down methods; review before applying.",
            "ما ترحيلات EF Core وكيف تضيف واحدة؟");
        SeedQuestion(questions, subByNameAndCategory, "Entity Framework", "Migrations & Schema",
            "How do you handle sensitive data in migrations (e.g. connection strings)?",
            "Avoid committing connection strings. Use configuration (appsettings, env vars, User Secrets). Migrations run at design time using the project's configuration; ensure dev connection is safe.",
            "كيف تتعامل مع البيانات الحساسة في الترحيلات؟", QuestionLevel.Junior);
        SeedQuestion(questions, subByNameAndCategory, "Entity Framework", "Migrations & Schema",
            "What is a shadow property and when would you use it?",
            "A property that has no CLR property on the entity but is mapped in the model. Use for audit fields (CreatedAt, UpdatedBy) or other columns you don't want on the entity type.",
            "ما الخاصية الظلية ومتى تستخدمها؟", QuestionLevel.Senior);

        // Entity Framework – Query Performance
        SeedQuestion(questions, subByNameAndCategory, "Entity Framework", "Query Performance",
            "How do you log or inspect the SQL generated by EF Core?",
            "Use LogTo() or EnableSensitiveDataLogging in development. Alternatively, use a logging provider and set LogLevel for Microsoft.EntityFrameworkCore.Database.Command to Information.",
            "كيف تسجل أو تفحص الـ SQL المُنشأ من EF Core؟");
        SeedQuestion(questions, subByNameAndCategory, "Entity Framework", "Query Performance",
            "What are compiled queries and when are they useful?",
            "CompiledQuery.Compile() compiles a query once and reuses the plan. Useful for hot-path queries that run often with the same shape; reduces planning overhead.",
            "ما الاستعلامات المترجمة ومتى تكون مفيدة؟", QuestionLevel.Senior);
        SeedQuestion(questions, subByNameAndCategory, "Entity Framework", "Query Performance",
            "How would you optimize a slow EF Core query?",
            "Use AsNoTracking() for read-only; project only needed columns; add Include only when needed; add DB indexes; avoid client evaluation (check logs); consider raw SQL or stored procs for complex queries.",
            "كيف تحسن استعلام EF Core البطيء؟", QuestionLevel.Senior);

        // SQL & Database – T-SQL (more)
        SeedQuestion(questions, subByNameAndCategory, "SQL & Database", "T-SQL Queries",
            "What is the difference between WHERE and HAVING?",
            "WHERE filters rows before grouping; HAVING filters after GROUP BY. Use HAVING for conditions on aggregates (e.g. HAVING COUNT(*) > 1).",
            "ما الفرق بين WHERE و HAVING؟");
        SeedQuestion(questions, subByNameAndCategory, "SQL & Database", "T-SQL Queries",
            "Explain CTEs (Common Table Expressions) and when to use them.",
            "CTE: WITH cte AS (SELECT ...) SELECT * FROM cte. Improves readability for complex queries and allows recursion. Use for multi-step logic or recursive hierarchies.",
            "اشرح تعابير الجدول الشائعة (CTE) ومتى تستخدمها.", QuestionLevel.MidLevel);
        SeedQuestion(questions, subByNameAndCategory, "SQL & Database", "T-SQL Queries",
            "What are window functions? Give examples.",
            "Window functions compute over a partition without collapsing rows. Examples: ROW_NUMBER(), RANK(), SUM() OVER (PARTITION BY ... ORDER BY ...), LAG/LEAD. Use for rankings, running totals, and row-to-row comparison.",
            "ما دوال النافذة؟ أعطِ أمثلة.", QuestionLevel.MidLevel);

        // SQL & Database – Indexes & Optimization
        SeedQuestion(questions, subByNameAndCategory, "SQL & Database", "Indexes & Optimization",
            "What is a clustered vs non-clustered index?",
            "Clustered: one per table; determines physical row order. Non-clustered: separate structure with pointer to the row. Choose clustered key carefully (often PK); add non-clustered for filter/sort columns.",
            "ما الفرق بين الفهرس العنقودي وغير العنقودي؟");
        SeedQuestion(questions, subByNameAndCategory, "SQL & Database", "Indexes & Optimization",
            "When would an index not help or even hurt performance?",
            "Small tables (scan is cheap); very high write volume (index maintenance cost); wrong index for the query. Too many indexes slow inserts/updates. Measure with execution plans and workload.",
            "متى لا يفيد الفهرس أو يضر بالأداء؟", QuestionLevel.Senior);
        SeedQuestion(questions, subByNameAndCategory, "SQL & Database", "Indexes & Optimization",
            "What is a covering index?",
            "An index that contains all columns needed by a query (including in INCLUDE). The engine can satisfy the query from the index alone without key lookups, improving performance.",
            "ما الفهرس المغلق؟", QuestionLevel.MidLevel);

        // SQL & Database – Transactions
        SeedQuestion(questions, subByNameAndCategory, "SQL & Database", "Transactions",
            "What are ACID properties?",
            "Atomicity: all or nothing. Consistency: valid state before and after. Isolation: concurrent transactions don't see uncommitted data in a harmful way. Durability: committed data persists.",
            "ما خصائص ACID؟");
        SeedQuestion(questions, subByNameAndCategory, "SQL & Database", "Transactions",
            "Explain isolation levels (e.g. Read Committed, Serializable).",
            "Read Uncommitted: dirty reads. Read Committed: no dirty reads. Repeatable Read: no dirty reads, repeatable reads. Serializable: full isolation. Higher levels reduce anomalies but can increase blocking and deadlocks.",
            "اشرح مستويات العزل (مثل Read Committed و Serializable).", QuestionLevel.Senior);

        // JavaScript & Frontend – JavaScript (more)
        SeedQuestion(questions, subByNameAndCategory, "JavaScript & Frontend", "JavaScript Fundamentals",
            "What is the difference between let, const, and var?",
            "let and const are block-scoped; const is read-only binding. var is function-scoped and hoisted. Prefer const by default; let when reassignment is needed; avoid var in new code.",
            "ما الفرق بين let و const و var؟");
        SeedQuestion(questions, subByNameAndCategory, "JavaScript & Frontend", "JavaScript Fundamentals",
            "Explain closures and a practical use.",
            "Closure: a function retains access to variables from its enclosing scope. Use for private state, factories, or callbacks. Be careful with loops and closures (use let or IIFE).",
            "اشرح الإغلاقات واستخدامًا عمليًا.", QuestionLevel.Junior);
        SeedQuestion(questions, subByNameAndCategory, "JavaScript & Frontend", "JavaScript Fundamentals",
            "What are Promises and async/await?",
            "Promises represent a future value or error. async/await is syntax for consuming promises: async functions return a promise; await pauses until the promise settles. Use for asynchronous flow without deep callback nesting.",
            "ما الـ Promises و async/await؟", QuestionLevel.MidLevel);

        // JavaScript & Frontend – React
        SeedQuestion(questions, subByNameAndCategory, "JavaScript & Frontend", "React",
            "What is the virtual DOM and how does React use it?",
            "Virtual DOM is an in-memory representation of the UI. React diffs it with the previous version and updates the real DOM only where needed, reducing expensive DOM operations.",
            "ما الـ Virtual DOM وكيف يستخدمه React؟");
        SeedQuestion(questions, subByNameAndCategory, "JavaScript & Frontend", "React",
            "Explain React hooks: useState and useEffect.",
            "useState holds component state; updating it triggers re-render. useEffect runs side effects after render; dependency array controls when it re-runs. Use for data fetch, subscriptions, or syncing with external systems.",
            "اشرح خطافات React: useState و useEffect.", QuestionLevel.Junior);
        SeedQuestion(questions, subByNameAndCategory, "JavaScript & Frontend", "React",
            "What is the difference between controlled and uncontrolled components?",
            "Controlled: form state lives in React state; value and onChange are set by the parent. Uncontrolled: the DOM holds state; use refs to read. Prefer controlled for validation and single source of truth.",
            "ما الفرق بين المكونات المتحكم بها وغير المتحكم بها؟", QuestionLevel.MidLevel);
        SeedQuestion(questions, subByNameAndCategory, "JavaScript & Frontend", "React",
            "When would you use useMemo vs useCallback?",
            "useMemo memoizes a computed value; useCallback memoizes a function reference. Use to avoid unnecessary recalculations or child re-renders when passing callbacks. Don't over-optimize.",
            "متى تستخدم useMemo ومتى useCallback؟", QuestionLevel.Senior);

        // JavaScript & Frontend – TypeScript
        SeedQuestion(questions, subByNameAndCategory, "JavaScript & Frontend", "TypeScript",
            "What are types vs interfaces in TypeScript?",
            "Both describe shapes. Interfaces can be extended and merged; types can do unions and mapped types. Prefer interface for object shapes; type for unions/intersections/aliases.",
            "ما الفرق بين types و interfaces في TypeScript؟");
        SeedQuestion(questions, subByNameAndCategory, "JavaScript & Frontend", "TypeScript",
            "Explain generics in TypeScript with an example.",
            "Generics parameterize types: function identity<T>(x: T): T { return x; }. Use for reusable, type-safe APIs (e.g. ApiResult<T>, Array<T>). Constrain with extends when needed.",
            "اشرح الأنواع العامة في TypeScript مع مثال.", QuestionLevel.Junior);
        SeedQuestion(questions, subByNameAndCategory, "JavaScript & Frontend", "TypeScript",
            "What is strict mode and why use it?",
            "Strict mode enables stricter checks (strictNullChecks, noImplicitAny, etc.). Catches more bugs at compile time. Enable in tsconfig.json; adopt gradually if migrating a large codebase.",
            "ما الوضع الصارم ولماذا تستخدمه؟", QuestionLevel.MidLevel);

        // System Design & Architecture – Clean Architecture (more)
        SeedQuestion(questions, subByNameAndCategory, "System Design & Architecture", "Clean Architecture",
            "What is the Dependency Rule?",
            "Dependencies point inward. Domain has no dependencies. Application depends on domain. Infrastructure and Presentation depend on Application (and domain). No outward dependencies from inner layers.",
            "ما قاعدة التبعيات؟", QuestionLevel.MidLevel);
        SeedQuestion(questions, subByNameAndCategory, "System Design & Architecture", "Clean Architecture",
            "Why keep the domain free of infrastructure concerns?",
            "Domain should model business rules only. Infrastructure (DB, HTTP, file system) changes over time. Keeping domain pure makes it testable and portable; you can swap implementations without changing core logic.",
            "لماذا نبقي النطاق خاليًا من البنية التحتية؟", QuestionLevel.Senior);

        // System Design & Architecture – Microservices
        SeedQuestion(questions, subByNameAndCategory, "System Design & Architecture", "Microservices",
            "What are the benefits and trade-offs of microservices?",
            "Benefits: independent deployability, scaling, technology diversity. Trade-offs: distributed complexity, network latency, eventual consistency, operational overhead. Use when team size and domain justify it.",
            "ما فوائد وتضحيات الخدمات المصغرة؟", QuestionLevel.MidLevel);
        SeedQuestion(questions, subByNameAndCategory, "System Design & Architecture", "Microservices",
            "How do microservices communicate? When sync vs async?",
            "Sync: HTTP/gRPC for request-response. Async: message queues (e.g. RabbitMQ, Kafka) for events. Use sync when you need immediate response; async for decoupling, resilience, and event-driven flows.",
            "كيف تتواصل الخدمات المصغرة؟ متى تزامني ومتى غير تزامني؟", QuestionLevel.Senior);
        SeedQuestion(questions, subByNameAndCategory, "System Design & Architecture", "Microservices",
            "What is the API Gateway pattern?",
            "Single entry point for clients; routes to backend services, can aggregate responses, handle auth, rate limiting, and translation. Reduces round-trips and centralizes cross-cutting concerns.",
            "ما نمط بوابة الـ API؟", QuestionLevel.Senior);

        // System Design & Architecture – CQRS & Event Sourcing
        SeedQuestion(questions, subByNameAndCategory, "System Design & Architecture", "CQRS & Event Sourcing",
            "What is CQRS?",
            "Command Query Responsibility Segregation: separate read and write models. Commands change state; queries return data. Allows different scaling and storage for reads vs writes; can use different models per side.",
            "ما CQRS؟", QuestionLevel.MidLevel);
        SeedQuestion(questions, subByNameAndCategory, "System Design & Architecture", "CQRS & Event Sourcing",
            "What is event sourcing in simple terms?",
            "Store changes as a log of events instead of current state. State is derived by replaying events. Enables audit, time-travel, and multiple read models. Complexity: storage, replay, and eventual consistency.",
            "ما تخزين الأحداث باختصار؟", QuestionLevel.Senior);
        SeedQuestion(questions, subByNameAndCategory, "System Design & Architecture", "CQRS & Event Sourcing",
            "When would you choose CQRS or event sourcing?",
            "CQRS: when read and write patterns differ significantly or you need different scalability. Event sourcing: when you need full history, audit, or complex event-driven logic. Both add complexity; use when benefits outweigh cost.",
            "متى تختار CQRS أو تخزين الأحداث؟", QuestionLevel.Senior);

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
        string answer,
        string? titleAr = null,
        QuestionLevel level = QuestionLevel.Junior)
    {
        if (!subByNameAndCategory.TryGetValue(categoryName, out var subs) ||
            !subs.TryGetValue(subCategoryName, out var sub))
            return;

        list.Add(new Question
        {
            Title = title,
            TitleAr = titleAr ?? "",
            Answer = answer,
            CategoryId = sub.CategoryId,
            SubCategoryId = sub.Id,
            Level = level,
            IsActive = true
        });
    }
}
