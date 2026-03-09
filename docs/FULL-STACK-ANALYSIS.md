# Interviewify — Deep Full-Stack Analysis

A complete product, architecture, codebase, and integration audit across the .NET Core backend and Next.js frontend. This document is the source of truth for refactor planning.

---

## 1. Product summary

**What the product really is**  
Interviewify is a **.NET Core technical interview preparation platform**: a content hub of categories (e.g. C#, ASP.NET Core, EF Core), subcategories (modules), and Q&A (title + model answer). Public users browse and read; authenticated admins manage content and users. There is no self-registration.

**Who it is for**  
- **Candidates (public):** .NET developers preparing for interviews; they browse categories → subcategories → questions and read answers.  
- **Admins (authenticated):** Content managers who CRUD categories, subcategories, questions, and users; use dashboard and account settings.  
- **Users (authenticated, non-admin):** Role exists in the data model but has no distinct product experience; they see the same dashboard as admin but cannot access Users API (403 on Settings counts).

**Real MVP**  
- **Public:** Browse categories → open category → see modules and question list for that category → open question → read with prev/next.  
- **Authenticated:** Login → dashboard (real stats) → manage categories/subcategories/questions/users → account (profile, change password).  
- **In scope:** Category/SubCategory/Question CRUD and display; working “Start Journey” and “Challenge Repository” (questions by category); honest messaging; no dead links.  
- **Out of scope:** Registration; progress/bookmarks; mock interviews; roadmaps; analytics/success rate; overstated marketing copy.

**Current product direction**  
Internal training tool / portfolio showcase. Invite-only (admin-created users). No billing or growth metrics.

**What should be in scope now**  
Fix broken flows (questions-by-category, dashboard real data, Settings for non-admin); align messaging; remove fake data and dead links; consolidate subcategory management; optional Category description.

**What should be out of scope now**  
Registration, progress tracking, roadmaps, mock interviews, analytics, “personalized prep / real-time feedback / data-driven insights” as product claims.

---

## 2. Domain/business analysis

**Core entities**  
- **User:** Id, FullName, Email, PasswordHash, Role (Admin/User), Status (Active/Inactive), ProfilePicture; RefreshTokens.  
- **Category:** Id, Name, IsActive; SubCategories. No Description or ImageUrl.  
- **SubCategory:** Id, Name, CategoryId; Category, Questions. No IsActive or SortOrder.  
- **Question:** Id, Title, Answer, CategoryId, SubCategoryId, IsActive, CreatedAt; Category, SubCategory.  
- **RefreshToken:** Id, Token, ExpirationDate, IsRevoked, UserId.

**Relationships**  
- Category → SubCategory → Question: clear hierarchy.  
- User is not linked to content (no progress, bookmarks, or completion).  
- SubCategory has no IsActive (Category and Question have it); no ordering field.

**Terminology problems**  
- **Domian** (folder/namespace): typo; should be **Domain**.  
- **Module** (UI) vs **SubCategory** (domain): used interchangeably; acceptable but could be aligned.  
- **Challenge Repository / Active Challenges:** UI-only; no extra domain concept.

**Missing fields**  
- **Category:** Description (frontend expects it for cards/detail); ImageUrl optional (frontend uses heuristic from name).  
- **SubCategory:** IsActive, SortOrder (optional for consistency and ordering).  
- **Question:** Difficulty, tags, sort order (optional, later).  
- **Dashboard/Stats:** No aggregate DTO; dashboard and Settings need counts without calling forbidden or multiple APIs.

**Domain mismatches**  
- Frontend `Category` has `id: string`, `description?`, `image?`; backend entity and DTOs have `Id` (int), no description/image.  
- Frontend `SubCategory` has `id: string`; backend uses int. Coercion in templates often hides the type mismatch.

**Business logic gaps**  
- No “questions by category” in backend; Category detail page depends on it.  
- No stats endpoint; Dashboard and Settings either use fake data or call Admin-only APIs.  
- Lookups (e.g. GetUsers) are unauthenticated; sensitive data should be restricted.  
- User role has no distinct flows or UI; non-admin Settings calls getAllUsers() and gets 403.

---

## 3. Backend analysis

**Strengths**  
- Clear layering: API → Application (services, DTOs, validators) → Infrastructure (repositories, EF, JWT, file) → Domain (entities).  
- CQRS-style feature folders (Categories, SubCategories, Questions, Users, Auth, Lookups).  
- Consistent ApiResult wrapper; FluentValidation for inputs; JWT + refresh tokens; role-based authorization on controllers.  
- Repository pattern and UnitOfWork; EF Core with configurations and migrations.  
- Route constants in ApiRoutes; dependency injection wired in Application and Infrastructure.

**Weaknesses**  
- **Missing endpoint:** GET questions by category. Frontend calls `/questions/by-category/{id}`; no route, repository method, or service method.  
- **Domian** typo in folder and namespace.  
- **LookupsController:** No `[Authorize]`; GetUsers (and optionally others) should be Admin-only. Uses `api/[controller]` instead of ApiRoutes.  
- **Category:** No Description or ImageUrl in entity/DTOs despite frontend use.  
- **No stats endpoint:** Dashboard and Settings cannot get counts in a role-safe way.

**Architecture issues**  
- LookupsController is not aligned with ApiRoutes (different route pattern).  
- No dedicated dashboard/stats API; counts are implied by existing endpoints but not aggregated.

**Endpoint/API issues**  
- Questions: only GetAll, GetBySubCategoryId, GetById; no GetByCategoryId.  
- Account: profile and change-password only; no stats.  
- Unused or redundant endpoints: none identified; missing one is the main gap.

**DTO issues**  
- CategoryResponseDto: no Description or ImageUrl.  
- No StatsDto or equivalent for dashboard/Settings.  
- ApiResult uses PascalCase in C#; ASP.NET Core default JSON serialization is camelCase, so response shape is fine for frontend.

**Validation/auth/permissions issues**  
- Auth: Login and Refresh are AllowAnonymous; Logout is Authorize. Good.  
- UsersController: full [Authorize(Roles = "Admin")]. Good.  
- LookupsController: no authorization; GetUsers exposes user list to anonymous or any authenticated user.

**Technical debt**  
- Domian → Domain rename.  
- QuestionRepository could add GetByCategoryIdAsync and filter by CategoryId (and IsActive).  
- Optional: SubCategory IsActive/SortOrder if product needs them.

**Refactor recommendations**  
- Add GET `/api/questions/by-category/{categoryId}` (repository, service, controller, route).  
- Add GET `/api/account/stats` or `/api/dashboard/stats` (category count, question count, user count for Admin only).  
- Add Category.Description (and optionally ImageUrl); migration and DTOs.  
- Restrict Lookups GetUsers (and optionally roles/statuses) to Admin.  
- Rename Domian → Domain.  
- Align LookupsController with ApiRoutes if desired.

---

## 4. Frontend analysis

**Strengths**  
- Next.js App Router with clear layout (root, (loading), (login), dashboard).  
- Feature-based organization (auth, categories, questions, dashboard).  
- Redux Toolkit + slices (auth, categories, subCategories, questions, users, lookups); persisted auth.  
- Central API client with JWT attachment and refresh logic; services per domain.  
- Shared components (PageHeader, StatsCard, DataTable, DataGrid, ConfirmModal, StatusBadge, LookupSelect).  
- Role-aware nav (dashboard for authenticated); theme toggle and theme provider.

**Weaknesses**  
- **Dashboard home:** All stats hardcoded (12, 450, 2400, 78%); “Recent Categories” is a static array; “Platform Growth” and “Quick Resources” are placeholder content.  
- **Settings page:** Calls categoryService.getAllCategories(), questionService.getAllQuestions(), userService.getAllUsers() for counts; non-admin gets 403 on getAllUsers and no fallback.  
- **Category details:** Depends on questionService.getQuestionsByCategory(categoryId) which hits non-existent API; “Start Journey” and “Challenge Repository” fail or show empty.  
- **404 page:** “Explore Questions” links to `/dashboard/questions` (valid for logged-in users) but may confuse anonymous users.  
- **Duplicate management:** `/dashboard/subcategories` exists as a standalone page; Categories page also manages subcategories in tabs. Sidebar does not link to Subcategories; consolidation is still desirable.

**Route/page issues**  
- No `/explore` or `/community` (already removed from home nav in Step 1).  
- Dashboard subcategories route could redirect to dashboard/categories with a tab.  
- All other routes are valid and used.

**Component/props issues**  
- **CategoryCard / CategoryDetailsPage:** Expect `category.description` and `category.image`; API does not provide them (fallbacks used).  
- **Category type:** `id: string`; API returns number; comparison and links often work via coercion.  
- **Question type:** `id: string`; same coercion.  
- **StatsCard:** Receives value as string; dashboard passes hardcoded strings; no issue once values come from API.  
- **DataTable/DataGrid:** Used consistently; Column<T> and render props are clear.

**State/API issues**  
- categorySlice stores Category[] from API; no server-side normalization of id (number → string).  
- questionService.getQuestionsByCategory calls non-existent endpoint; error is caught but Category detail shows empty or fails.  
- Settings fetchCounts does not handle 403; non-admin sees failed count or console error.  
- Loading/error/empty states: home has been fixed (no mock fallback; retry); category detail and subcategory pages have loading; empty states exist.

**Role/UI issues**  
- Dashboard and sidebar do not hide “Users” or other admin-only areas for non-admin; both roles see the same nav. Non-admin can open Users page and get 403 on API.  
- Settings page does not branch on role for which counts to fetch.

**Technical debt**  
- Hardcoded dashboard stats and recent categories.  
- Placeholder “Platform Growth” and “Quick Resources” content.  
- Optional: stricter TypeScript types for id (number vs string) to match API.  
- Optional: role-based sidebar (hide Users for non-admin).

**Refactor recommendations**  
- Replace dashboard home data with stats API and real categories fetch.  
- Settings: use stats endpoint only; do not call getAllUsers for non-admin.  
- Ensure Category details uses new questions-by-category endpoint once backend adds it.  
- Redirect /dashboard/subcategories to /dashboard/categories (e.g. with tab).  
- Optional: hide “Users” in sidebar for non-admin; optional: role-based dashboard content.

---

## 5. Frontend/backend integration analysis

**Contract mismatches**  
- **Questions by category:** Frontend calls GET `/questions/by-category/${categoryId}`; backend has no such route or handler. **Broken.**  
- **Category:** Frontend expects optional `description` and `image`; backend returns neither. Fallbacks and heuristics used; not broken but inconsistent.  
- **Ids:** Backend uses int; frontend types often use string. Coercion in links and comparisons; no runtime break.  
- **ApiResponse:** Frontend type includes `statusCode`; backend ApiResult does not return statusCode in body (HTTP status is separate). If frontend reads response.status from axios, fine; if it expects body.statusCode, clarify.

**Broken integrations**  
- **Category detail → questions:** getQuestionsByCategory fails (404 or network error); Category details page shows empty “Challenge Repository” and “Start Journey” does nothing useful.  
- **Settings counts (non-admin):** getAllUsers() returns 403; fetchCounts catches error but user count is wrong or missing; no stats endpoint to fall back on.  
- **Dashboard home:** No integration; all data is hardcoded.

**Missing fields/endpoints**  
- **Missing endpoint:** GET `/api/questions/by-category/{categoryId}`.  
- **Missing endpoint:** GET `/api/account/stats` or `/api/dashboard/stats` (counts, role-aware).  
- **Missing DTO/entity fields:** Category.Description (and optionally ImageUrl).  
- **Missing DTO:** Stats response (e.g. categoryCount, questionCount, userCount?).

**Fragile assumptions**  
- Frontend assumes questions-by-category exists.  
- Frontend assumes any authenticated user can call getAllUsers for counts.  
- Frontend assumes Category has description/image for display; backend does not store them.

**Recommended fixes**  
- Add and use GET questions/by-category in backend and frontend.  
- Add stats endpoint; dashboard and Settings use it; non-admin does not receive user count.  
- Add Category.Description (and optionally ImageUrl); expose in DTOs and UI.  
- Restrict Lookups GetUsers to Admin; frontend only calls it in admin context (e.g. User management).

---

## 6. Keep / Fix / Remove / Merge / Build Later table

| Item | Type | Decision | Reason | Priority |
|------|------|----------|--------|----------|
| Categories (public) | Feature | Keep | Core. | P0 |
| Categories (admin CRUD) | Feature | Keep | Core. | P0 |
| Subcategories | Feature | Keep | Core. | P0 |
| Questions (public + admin) | Feature | Keep | Core. | P0 |
| Question detail page | Page | Keep | Core. | P0 |
| Auth (login, refresh, logout) | Feature | Keep | Required. | P0 |
| Admin / User roles | Role | Keep | Fix User experience and permissions. | P0/P2 |
| Dashboard layout & nav | Module | Keep | Admin surface. | P0 |
| Dashboard home | Page | **Fix** | Replace mock data with real stats + categories. | P1 |
| Categories management | Page | Keep | Core. | P0 |
| Questions management | Page | Keep | Core. | P0 |
| Users management | Page | Keep | Core. | P0 |
| Settings / Account | Page | **Fix** | Use stats API; no getAllUsers for non-admin. | P1 |
| GET questions/by-category | API | **Fix** | Add endpoint + use in Category detail. | P0 |
| Stats endpoint | API | **Fix** | Add for dashboard and Settings. | P1 |
| Category.Description | Domain/DTO | **Fix** | Add field + DTO + UI. | P1 |
| Category.ImageUrl | Domain/DTO | Build Later | Optional. | P2 |
| Lookups GetUsers | API | **Fix** | Restrict to Admin. | P1 |
| Domian folder | Module | **Fix** | Rename to Domain. | P2 |
| /dashboard/subcategories | Route | **Merge** | Redirect to /dashboard/categories. | P1 |
| Mock dashboard stats | Data | **Remove** | Replace with API. | P1 |
| Mock recent categories | Data | **Remove** | Replace with API. | P1 |
| Placeholder Platform Growth / Quick Resources | Content | Remove or simplify | Not real data. | P2 |
| 404 “Explore Questions” → /dashboard/questions | Link | Keep or adjust | Valid for logged-in; consider “Go home” for anonymous. | P2 |
| Roadmaps / Mock interviews | Feature | Build Later | Not in MVP. | Future |
| Progress / bookmarks | Feature | Build Later | Not in MVP. | Future |
| Registration | Feature | Build Later | Not in MVP. | Future |

---

## 7. Broken flows table

| Flow | Current behavior | What is broken | Root cause | FE / BE / Both | Required fix | Priority |
|------|------------------|----------------|------------|----------------|--------------|----------|
| Home → Category → Start Journey | User clicks “Start Journey” on category detail. | Cannot open first question or list is empty. | Frontend calls getQuestionsByCategory → GET /questions/by-category/{id}; endpoint does not exist. | Both | Add GET questions/by-category; FE already calls it. | P0 |
| Category detail → Challenge Repository | Category page shows question list. | Empty or request fails. | Same missing endpoint. | Both | Same. | P0 |
| Dashboard home metrics | Admin sees four stats and table. | All numbers and rows are hardcoded. | No stats API; no categories fetch for table. | Both | Add stats endpoint; fetch categories; replace all mock data. | P1 |
| Settings page (non-admin) | User opens Settings; page fetches counts. | getAllUsers() returns 403; counts fail. | Users API is Admin-only; Settings does not branch by role. | Both | Use stats endpoint only; do not call getAllUsers for non-admin. | P1 |
| Category detail load | Page loads category + questions in parallel. | questions request fails; questions always empty. | Missing backend route. | Both | Add and use questions-by-category. | P0 |
| Lookups GetUsers | Any client can call GET /lookups/users. | Exposes user list without auth. | LookupsController has no [Authorize]. | BE | Restrict GetUsers (and optionally others) to Admin. | P1 |
| Subcategory management | Two entry points: Categories tab and /dashboard/subcategories. | Redundant. | Historical or duplicate page. | FE | Redirect subcategories → categories. | P1 |

---

## 8. Missing fields / props / DTOs table

| Entity/Component/DTO | Missing field/prop | Why needed | Needed now or later | Priority |
|----------------------|--------------------|------------|---------------------|----------|
| Category (entity + DTOs) | Description | Frontend shows description on cards and detail; currently fallback text. | Now | P1 |
| Category (entity + DTOs) | ImageUrl | Frontend uses heuristic from name; optional editable image. | Later (or Now if desired) | P2 |
| Backend | Stats DTO / endpoint | Dashboard and Settings need counts without multiple or forbidden calls. | Now | P1 |
| Frontend Category type | — | Already has description?, image?; backend must provide for consistency. | Now (once BE adds) | P1 |
| SubCategory (entity) | IsActive, SortOrder | Consistency with Category/Question; ordering. | Later | P2 |
| Question (entity) | Difficulty, tags, etc. | Nice-to-have for future. | Later | — |
| ApiResponse (frontend) | — | statusCode may come from axios; confirm no reliance on body.statusCode. | Now (verify only) | P2 |

---

## 9. Refactor blueprint

**Phase 1: Truth alignment**  
- **Objective:** Product and messaging match reality; no fake data or dead links.  
- **Tasks:** Already done in Step 1: siteConfig description, nav/footer cleanup, mock categories removal, login copy, empty/error state on home.  
- **Dependencies:** None.  
- **Risks:** Low.  
- **Impact:** Honest product presentation.

**Phase 2: Broken flow fixes**  
- **Objective:** Core flows work: category → questions, dashboard and Settings use real data.  
- **Tasks:** Add GET questions/by-category (BE); add stats endpoint (BE); Dashboard home use stats + categories (FE); Settings use stats only, no getAllUsers for non-admin (FE).  
- **Dependencies:** Phase 1 done.  
- **Risks:** Low.  
- **Impact:** Start Journey and Challenge Repository work; dashboard and Settings truthful and role-safe.

**Phase 3: Backend/domain cleanup**  
- **Objective:** Domain and API align with product needs.  
- **Tasks:** Add Category.Description (and optionally ImageUrl): entity, migration, DTOs, admin UI; rename Domian → Domain; restrict Lookups GetUsers to Admin.  
- **Dependencies:** Phase 2 can proceed in parallel.  
- **Risks:** Low.  
- **Impact:** Real descriptions; cleaner naming; safer lookups.

**Phase 4: Frontend cleanup**  
- **Objective:** Single place for subcategory management; remove placeholder content; optional role-based UI.  
- **Tasks:** Redirect /dashboard/subcategories to /dashboard/categories; remove or simplify “Platform Growth” and “Quick Resources” placeholders; optional: hide Users nav for non-admin.  
- **Dependencies:** Phase 2.  
- **Risks:** Low.  
- **Impact:** Clearer admin UX; less misleading content.

**Phase 5: Integration cleanup**  
- **Objective:** Contracts and types aligned; no fragile assumptions.  
- **Tasks:** Confirm API JSON (camelCase) and frontend types; ensure Category type and forms use description (and image if added); optional: id as number in frontend types where appropriate.  
- **Dependencies:** Phase 3.  
- **Risks:** Low.  
- **Impact:** Predictable integration; fewer type mismatches.

**Phase 6: Future roadmap**  
- **Objective:** Not implemented now; document for later.  
- **Items:** Registration; progress/bookmarks; roadmaps; mock interviews; analytics; B2B/teams.  
- **Dependencies:** MVP stable.  
- **Risks:** N/A.  
- **Impact:** Clear backlog.

---

## 10. Prioritized backlog

| Task | Reason | Layer | Risk | Difficulty | Priority |
|------|--------|-------|------|------------|----------|
| Add GET questions/by-category | Start Journey and Challenge Repository work. | BE + FE verify | Low | Small | P0 |
| Add stats endpoint | Dashboard and Settings need real counts; role-safe. | BE | Low | Small | P1 |
| Dashboard home: use stats + real categories | Remove fake metrics and table. | FE | Low | Small | P1 |
| Settings: use stats only; no getAllUsers for non-admin | Avoid 403; role-safe counts. | FE | Low | Small | P1 |
| Add Category.Description (+ migration, DTOs, UI) | Real copy on cards and detail. | BE + FE | Low | Medium | P1 |
| Restrict Lookups GetUsers to Admin | Security. | BE | Low | Trivial | P1 |
| Redirect /dashboard/subcategories → categories | Single management surface. | FE | Low | Small | P1 |
| Rename Domian → Domain | Code quality. | BE | Low | Small | P2 |
| Remove or simplify Platform Growth / Quick Resources | Honest dashboard. | FE | Low | Trivial | P2 |
| Optional: Category.ImageUrl | Editable images. | BE + FE | Low | Medium | P2 |
| Optional: role-based sidebar (hide Users for non-admin) | Clearer UX. | FE | Low | Small | P2 |

---

## 11. Recommended implementation order

1. **Add GET questions/by-category** (backend: repository, service, controller, route; frontend: verify questionService URL).
2. **Add stats endpoint** (backend: DTO, controller, role-aware user count).
3. **Dashboard home** (frontend: call stats API and categories API; replace all hardcoded stats and recent categories).
4. **Settings page** (frontend: use stats endpoint for counts; do not call getAllUsers for non-admin).
5. **Category.Description** (backend: entity, migration, DTOs; frontend: types, forms, display).
6. **LookupsController** (backend: [Authorize(Roles = "Admin")] on GetUsers).
7. **Redirect /dashboard/subcategories** (frontend: redirect to /dashboard/categories).
8. **Rename Domian → Domain** (backend: folder, namespaces, references).
9. **Optional:** Simplify or remove Platform Growth / Quick Resources on dashboard.
10. **Optional:** Category.ImageUrl and/or role-based sidebar.

After this order, the product is coherent, core flows work, and the codebase is in good shape for future roadmap items. Do not implement Phase 6 (future roadmap) until the above is complete and the product direction explicitly expands.
