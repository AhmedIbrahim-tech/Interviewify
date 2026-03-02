namespace API.Routes;

public static class ApiRoutes
{
    public const string Base = "api";

    public static class Categories
    {
        public const string Controller = Base + "/categories";
        public const string GetAll = "";
        public const string Id = "{id:int}";
    }

    public static class SubCategories
    {
        public const string Controller = Base + "/subcategories";
        public const string ByCategoryId = "by-category/{categoryId:int}";
        public const string Id = "{id:int}";
    }

    public static class Questions
    {
        public const string Controller = Base + "/questions";
        public const string BySubCategoryId = "by-subcategory/{subCategoryId:int}";
        public const string Id = "{id:int}";
    }

    public static class Auth
    {
        public const string Controller = Base + "/auth";
        public const string Login = "login";
        public const string Refresh = "refresh";
        public const string Logout = "logout";
    }

    public static class Users
    {
        public const string Controller = Base + "/users";
        public const string GetAll = "";
        public const string Id = "{id:int}";
        public const string ToggleStatus = "{id:int}/toggle-status";
    }
}
