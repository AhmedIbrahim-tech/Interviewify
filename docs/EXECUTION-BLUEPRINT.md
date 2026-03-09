# Interviewify — Execution Blueprint & Refactor Plan

This document converts the existing product/business analysis into a concrete implementation roadmap. It is execution-focused and ordered for step-by-step implementation.

---

## 1. Product direction decision

**Recommendation: Treat Interviewify as an internal training tool / portfolio showcase for the immediate implementation.**

**Why this fits the current codebase:**
- No self-registration; only admins create users → invite-only or internal use.
- Content is organized for one audience: people who receive access (team, students, or demo users).
- Dashboard is admin/content-focused; there is no candidate-specific experience (progress, bookmarks).
- The feature set (categories → subcategories → Q&A + admin CRUD) matches an internal prep site or a strong portfolio piece, not a full commercial product.

**Immediate operating assumption:**
- **Primary:** Internal training tool or portfolio project.
- **Implications:** No need to build registration, billing, or “growth” metrics now. Do fix broken flows, remove fake/misleading content, and make the existing journey (browse + admin manage) coherent and honest.

**Future directions (explicitly out of scope for current implementation):**
- **SaaS / commercial prep platform:** Would require registration, progress tracking, possibly billing. Do not design or build for this until the product direction explicitly shifts.
- **Public “community” or roadmaps:** Currently promised in nav/footer but not built. Either remove the promise or add minimal placeholder pages; do not scope “roadmaps” or “mock interviews” as features for the current refactor.

**One clear recommendation:** Implement and refactor assuming **internal/portfolio**. Align copy, links, and features to that truth. Revisit direction when/if you add registration or commercial goals.

---

## 2. Real MVP definition

**What the MVP is today:**
- **Public (no login):** Browse categories → open a category → see subcategories (modules) and a list of questions for that category → open a question and read title + answer, with prev/next within the subcategory.
- **Authenticated (admin):** Log in → manage categories, subcategories, and questions in one place → manage users (create, edit, toggle status) → use Account Settings (profile, change password). Dashboard home shows real counts and recent activity.

**In scope for this MVP:**
- Category, SubCategory, Question CRUD and display.
- Public category/subcategory/question browsing with working “Start Journey” and “Challenge Repository” (questions by category).
- Login, refresh, logout; Admin and User roles.
- Admin-only: Users CRUD, content CRUD, dashboard real stats.
- Account: profile and change password for the logged-in user.
- Honest messaging: no claims about personalized prep, real-time feedback, data-driven insights, mock interviews, or roadmaps unless implemented.
- No dead links: every nav and footer link either works or is removed.

**Out of scope for now:**
- Self-registration / sign-up.
- Progress tracking, bookmarks, “completed” state.
- Mock interviews, roadmaps, community.
- Analytics, “success rate,” or engagement metrics beyond simple counts for admin.
- “Personalized prep,” “real-time feedback,” “data-driven insights” as product claims.

**Messaging changes to match MVP:**
- **Layout/siteConfig (`Client/src/config/site.ts`):** Change `description` from “Personalized prep, real-time feedback, and data-driven insights to help you land your dream job.” to something like: “Structured .NET Core interview prep — categories, modules, and curated Q&A.”
- **Home page:** Remove or reword any copy that implies community size, personalized roadmaps, or features that don’t exist.
- **Login page:** Remove “5,000+ engineers” and “personalized roadmaps” unless you add those features; use “Sign in” or “Admin sign in” instead of “Expert Sign In” if the product is internal/portfolio.
- **Footer:** Remove or make non-clickable (with “Coming soon” or remove) Mock Interviews, Roadmaps, About Us, Contact, Privacy Policy until they exist.

---

## 3. Keep / Fix / Remove / Build Later table

| Item | Type | Decision | Reason | Priority |
|------|------|----------|--------|----------|
| Categories (public) | Feature | **Keep** | Core content hierarchy. | P0 |
| Categories (admin CRUD) | Feature | **Keep** | Core. | P0 |
| Subcategories | Feature | **Keep** | Core; consolidate management in one place. | P0 |
| Questions (public list + detail) | Feature | **Keep** | Core. | P0 |
| Questions (admin CRUD) | Feature | **Keep** | Core. | P0 |
| Question detail page (immersive, prev/next) | Page | **Keep** | Core candidate experience. | P0 |
| Auth (login, refresh, logout) | Feature | **Keep** | Required for admin. | P0 |
| User role | Role | **Keep** | Exists in DB; clarify purpose or hide dashboard for non-admin later. | P2 |
| Admin role | Role | **Keep** | Required. | P0 |
| Dashboard (layout, nav) | Module | **Keep** | Admin surface. | P0 |
| Dashboard home | Page | **Fix** | Replace mock stats and recent data with real API. | P1 |
| Categories management page | Page | **Keep** | Core admin. | P0 |
| Questions management page | Page | **Keep** | Core admin. | P0 |
| Users management page | Page | **Keep** | Core admin. | P0 |
| Settings / Account page | Page | **Fix** | Non-admin must not call getAllUsers(); use stats or skip. | P1 |
| /explore (nav “Questions”) | Link + Route | **Remove** or **Fix** | No route; 404. Either remove link or add page (e.g. redirect to / or categories). | P1 |
| /community (nav “Roadmaps”) | Link + Route | **Remove** | No roadmaps; remove link. | P1 |
| Footer: Question Bank, Mock Interviews, Roadmaps | Link | **Remove** or **Build Later** | Not implemented. Remove links or make non-navigable. | P1 |
| Footer: About Us, Contact, Privacy | Link | **Remove** or **Build Later** | Not implemented. Remove or add placeholders. | P2 |
| Mock home fallback (mockCategories) | Data | **Remove** | Don’t show fake categories on API failure; show error/empty state. | P1 |
| Dashboard mock stats (12, 450, 2400, 78%) | Data | **Remove** | Replace with real stats endpoint + UI. | P1 |
| Dashboard “Recent Categories” (hardcoded) | Data | **Remove** | Replace with real categories from API. | P1 |
| Questions-by-category flow | Flow/API | **Fix** | Add GET questions/by-category/{id}; used by Category detail. | P0 |
| Start Journey / Challenge Repository | Flow | **Fix** | Depends on questions-by-category. | P0 |
| Duplicate subcategory management | Module | **Merge** | One place: Categories page (tabs). Remove or redirect standalone Subcategories page. | P1 |
| Lookups (roles, categories, subcategories, users) | API | **Fix** | Restrict GetUsers (and sensitive lookups) to Admin. | P1 |
| “Real-time feedback / personalized prep / data-driven insights” | Messaging | **Remove** | Not implemented; in siteConfig and possibly layout. | P1 |
| “Expert Sign In” | Messaging | **Fix** | Align with product (e.g. “Sign in” or “Admin sign in”). | P2 |
| Login “5,000+ engineers / personalized roadmaps” | Messaging | **Remove** | Not true. | P1 |
| Domian folder name | Module | **Fix** | Rename to Domain. | P2 |
| Roadmaps (feature) | Feature | **Build Later** | Not in MVP. | Future |
| Mock interviews (feature) | Feature | **Build Later** | Not in MVP. | Future |
| Progress / bookmarks / completed | Feature | **Build Later** | Not in MVP. | Future |
| Candidate registration | Feature | **Build Later** | Not in MVP. | Future |
| Analytics / success rate | Feature | **Build Later** | Not in MVP. | Future |

---

## 4. Broken flows table

| Flow | Current behavior | What’s broken | Root cause | Required fix | FE / BE / Both | Priority |
|------|------------------|---------------|------------|--------------|----------------|----------|
| Home → Category → Start Journey | User clicks “Start Journey” on category detail. | Fails or empty; cannot open first question in category. | Frontend calls `getQuestionsByCategory(categoryId)` → GET `/questions/by-category/{id}`; endpoint does not exist. | Add GET `/api/questions/by-category/{categoryId}`; return active questions for that category (e.g. all subcategories). Update frontend to use it if not already. | Both | P0 |
| Category detail → Challenge Repository | Category page shows “Challenge Repository” with question list. | List empty or request fails. | Same as above; no questions-by-category API. | Same endpoint; Category details page already uses `questionService.getQuestionsByCategory`. | Both | P0 |
| Nav “Questions” → /explore | User clicks “Questions” in navbar. | 404 (no route). | No page at `/explore`. | Remove nav link or add route (e.g. redirect to `/` or list of categories). | FE | P1 |
| Nav “Roadmaps” → /community | User clicks “Roadmaps”. | 404. | No page at `/community`. | Remove nav link (roadmaps not in MVP). | FE | P1 |
| Dashboard home metrics | Admin sees Total Categories, Active Questions, Registered Users, Success Rate. | All numbers are hardcoded (12, 450, 2400, 78%). | No API; static values in DashboardHome. | Add stats endpoint (e.g. GET `/api/dashboard/stats` or `/api/account/stats`) returning real counts; dashboard calls it and displays. | Both | P1 |
| Dashboard home “Recent Categories” | Table shows “Recent Categories”. | Rows are hardcoded (e.g. C# Advanced Mastery, ASP.NET Core…). | No API; static array. | Fetch real categories (e.g. from existing GET categories, optionally sorted by id or date); show real list. | FE + existing BE | P1 |
| Settings page for non-admin | User (non-admin) opens Settings; page fetches profile and “counts”. | Counts fetch calls `userService.getAllUsers()` → 403. | Users API is Admin-only; Settings uses it for “counts”. | For non-admin, do not call getAllUsers. Use a stats endpoint that returns only allowed counts (e.g. categories + questions for all; users count only for admin), or skip counts for non-admin. | Both | P1 |
| Home when API fails | Categories fail to load. | Fallback: mockCategories with fake names/descriptions. | Intentional fallback in home page. | Remove mock fallback; show error state and optional retry. Do not show fake categories. | FE | P1 |
| Footer “Question Bank” / “Mock Interviews” / “Roadmaps” | User clicks. | No href or wrong page. | Placeholder list items. | Remove links or make non-clickable; or add real pages later. | FE | P1 |
| Subcategory page → first question | User goes to /subcategory/{id}. | If questions exist, redirect to first question; list never seen. | By design. | Accept as-is or optionally show list first with “Start” to go to first question. Document; no change required for MVP. | — | P2 |

---

## 5. Missing domain fields table

| Entity | Missing field | Why it’s needed | Priority | Now or later |
|--------|----------------|------------------|----------|--------------|
| Category | Description | Home and category detail show description; API has none. Enables real copy instead of fallback. | P1 | Now |
| Category | ImageUrl (optional) | Cards and detail use image; today frontend uses heuristic from name. Optional for MVP. | P2 | Later (or Now if you want editable images) |
| SubCategory | — | IsActive and SortOrder improve consistency and UX; not required for MVP. | P2 | Later |
| Question | — | difficulty, tags, sortOrder, lastReviewedAt are nice future improvements. | — | Later |
| Dashboard / Account | Stats DTO | Dashboard and Settings need category count, question count, and (for admin) user count without calling multiple APIs or forbidden ones. | P1 | Now |
| User | — | No missing fields for current MVP. | — | — |

**Summary:** Implement **Category.Description** and a **stats response DTO** (and endpoint) for the current refactor. Optionally add **Category.ImageUrl** if you want admin-editable images; otherwise keep using client-side image heuristic and add later.

---

## 6. Execution phases

### PHASE 1 — Product truth alignment

- **Objective:** Remove misleading copy, dead links, and fake data so the product presents itself honestly.
- **Tasks:**
  - Update `siteConfig.description` to match MVP (no “personalized prep,” “real-time feedback,” “data-driven insights”).
  - Remove or reword “Expert Sign In” and login page “5,000+ engineers” / “personalized roadmaps.”
  - Remove nav links to `/explore` and `/community` (or replace with working targets, e.g. “Questions” → `/` or `/dashboard/questions` for logged-in admin).
  - Remove or make non-clickable footer items: Mock Interviews, Roadmaps, About Us, Contact, Privacy Policy.
  - Remove mock categories fallback on home; show error/empty state when categories fail to load.
- **Dependencies:** None.
- **Risks:** Low. Some links disappear until you add pages later.
- **Impact:** Users and evaluators see an honest, coherent product.

---

### PHASE 2 — Broken flow fixes

- **Objective:** Make core user journeys work: category → questions, dashboard real data, settings for non-admin.
- **Tasks:**
  - **Backend:** Add GET `/api/questions/by-category/{categoryId}` (repository, service, controller). Return active questions for that category (e.g. all subcategories). Register route in ApiRoutes.
  - **Frontend:** Ensure Category details page uses this endpoint (it already calls `getQuestionsByCategory`; verify URL matches new route).
  - **Backend:** Add stats endpoint (e.g. GET `/api/account/stats` or `/api/dashboard/stats`) returning category count, question count, and for Admin role user count. Authorize so only logged-in user can call; restrict user count by role.
  - **Frontend:** Dashboard home: call stats API for numbers; fetch real categories (existing API) for “Recent Categories”; remove all hardcoded stats and table data.
  - **Frontend:** Settings page: for non-admin, do not call `getAllUsers()`. Call stats endpoint for counts (or skip user count for non-admin).
- **Dependencies:** Phase 1 optional (can be parallel); stats endpoint needed before dashboard/settings cleanup.
- **Risks:** Low. New endpoint is additive; frontend changes are localized.
- **Impact:** Start Journey and Challenge Repository work; dashboard and settings are truthful and don’t 403 for non-admin.

---

### PHASE 3 — Domain and contract improvements

- **Objective:** Add missing fields and align API contracts with UI needs.
- **Tasks:**
  - **Category:** Add `Description` (nullable string) to entity, migrations, DTOs (create/update/response), and admin UI. Optionally add `ImageUrl` (nullable string) if you want admin-editable images.
  - **Backend:** Ensure JSON serialization (camelCase) and DTOs match frontend expectations (ids, optional fields).
  - **Frontend:** Ensure category types and forms use `description` (and `imageUrl` if added). Remove reliance on mock-only fields.
- **Dependencies:** Phase 2 can proceed without this; Phase 3 can follow after or in parallel with Phase 2 for description.
- **Risks:** Low. Migration + DTO + UI for description.
- **Impact:** Real category descriptions (and optionally images) instead of placeholders.

---

### PHASE 4 — Admin / content management cleanup

- **Objective:** Single place for subcategory management; consistent permissions and behavior.
- **Tasks:**
  - **Subcategories:** Keep subcategory management only under Dashboard → Categories (tabs). Redirect `/dashboard/subcategories` to `/dashboard/categories` (e.g. with query or hash for subcategory tab). Remove “Subcategories” from sidebar if it appears as a separate item.
  - **Lookups:** Restrict sensitive lookups (e.g. GetUsers) to Admin. Optionally restrict other lookups to authenticated user if needed.
  - **Dashboard/Settings:** Confirm stats endpoint is used everywhere that needs counts; no direct getAllUsers for non-admin.
- **Dependencies:** Phase 2 (stats, permissions) recommended first.
- **Risks:** Low. Redirect and permission attributes.
- **Impact:** Clearer admin UX; no duplicate subcategory pages; safer lookups.

---

### PHASE 5 — Discoverability improvements

- **Objective:** Improve how users find content (without building new features like search).
- **Tasks:**
  - If “Questions” link was removed in Phase 1, consider adding a single “Browse” or “Categories” link to home that scrolls or navigates to category list.
  - Optional: add a simple “Explore” page that lists categories (reuse home category grid or list) so nav has a valid target.
  - Ensure home search/filter (by category name) works with real API data only (no mock).
- **Dependencies:** Phase 1 and 2.
- **Risks:** Low.
- **Impact:** Clear path from nav to content.

---

### PHASE 6 — Future roadmap (out of scope for current refactor)

- **Objective:** Do not implement now; document for later.
- **Items:** Candidate registration; progress tracking; bookmarks; “completed” state; roadmaps; mock interviews; analytics/success rate; B2B/teams.
- **When:** After MVP is stable and product direction shifts (e.g. to SaaS or public community).

---

## 7. Technical refactor plan

### Frontend

| Area | Action | Location / notes |
|------|--------|------------------|
| **Pages/routes** | Remove or fix nav to `/explore` and `/community`. | `Client/src/app/(loading)/page.tsx`: remove Links to `/explore` and `/community`, or point “Questions” to `/` or new explore page. |
| **Pages/routes** | Redirect `/dashboard/subcategories` to categories. | `Client/src/app/dashboard/subcategories/page.tsx`: redirect to `/dashboard/categories` (e.g. with `?tab=subcategories` or hash). Or remove route and sidebar entry. |
| **Components** | Remove mock fallback data. | `Client/src/app/(loading)/page.tsx`: remove `mockCategories`; when `categories.length === 0` and not loading, show error state (and optional retry). Don’t use `displayData = categories.length > 0 ? categories : mockCategories`. |
| **Footer** | Remove or disable unimplemented links. | Same file, footer: remove hrefs for Question Bank, Mock Interviews, Roadmaps, About Us, Contact, Privacy Policy; or make them `#` with “Coming soon” or remove. |
| **Dashboard home** | Replace mock stats and recent categories. | `Client/src/features/dashboard/pages/DashboardHome.tsx`: remove hardcoded `recentCategories` and stats (12, 450, 2400, 78%). Call stats API and categories API; render real data. |
| **Settings** | Stop calling getAllUsers for non-admin. | `Client/src/features/dashboard/pages/SettingsPage.tsx`: only call stats endpoint for counts; or for non-admin omit user count and use stats for categories/questions only. |
| **Category flow** | Verify questions-by-category usage. | `Client/src/features/categories/pages/CategoryDetailsPage.tsx`: already uses `questionService.getQuestionsByCategory(Number(id))`; ensure `questionService` uses new backend route (e.g. `/questions/by-category/${categoryId}`). |
| **API client** | Ensure questions-by-category URL matches backend. | `Client/src/services/questionService.ts`: `getQuestionsByCategory` should call GET `/questions/by-category/${categoryId}` (or whatever backend route is added). |
| **Config / copy** | Honest messaging. | `Client/src/config/site.ts`: set `description` to MVP-accurate text. Login page and layout: remove “personalized prep,” “real-time feedback,” “data-driven insights,” “5,000+ engineers,” “personalized roadmaps”; adjust “Expert Sign In” if desired. |
| **Role-based UI** | Optional: hide Dashboard for non-admin or show limited nav. | Not required for MVP; document “User” role purpose. Later: hide Users and maybe Questions/Categories for non-admin if needed. |

### Backend

| Area | Action | Location / notes |
|------|--------|------------------|
| **Endpoints** | Add GET questions by category. | New route: e.g. `GET /api/questions/by-category/{categoryId}`. Add to `ApiRoutes.Questions`, implement in `IQuestionRepository` (e.g. `GetByCategoryIdAsync`), `IQuestionService`, `QuestionService`, `QuestionsController`. Return active questions for that category (filter by CategoryId and IsActive). |
| **Endpoints** | Add stats endpoint. | New: e.g. `GET /api/account/stats` or `GET /api/dashboard/stats`. Returns e.g. `{ categoryCount, questionCount, userCount? }`. User count only when user is Admin. Use existing repos to count. |
| **DTOs** | Category description (and optional ImageUrl). | Add to `Category` entity, `CategoryResponseDto`, `CreateCategoryDto`, `UpdateCategoryDto`. DB migration. |
| **DTOs** | Stats response. | New DTO e.g. `StatsDto` or anonymous type: categoryCount, questionCount, userCount (optional). |
| **Entities** | Category.Description, optional ImageUrl. | `Domian/Entities/Category.cs` (and fix namespace when renaming Domian → Domain). |
| **Permissions** | Restrict Lookups GetUsers to Admin. | `API/Controllers/LookupsController.cs`: add `[Authorize(Roles = "Admin")]` to GetUsers (and any other sensitive lookup). |
| **Naming** | Fix Domian → Domain. | Rename folder `Domian` → `Domain`; update all namespaces and project references. |
| **Routes** | Register new question route. | `API/Routes/ApiRoutes.cs`: add e.g. `ByCategoryId = "by-category/{categoryId:int}"` under Questions and use in controller. |

### Integration

| Area | Action | Notes |
|------|--------|--------|
| **API contract** | Align category DTO with frontend. | After adding Description (and ImageUrl), ensure frontend Category type and forms use them; API returns camelCase if not already. |
| **Questions by category** | Frontend already calls this. | Confirm `questionService.getQuestionsByCategory(id)` URL matches new backend route; fix if backend uses different path. |
| **Stats** | Single endpoint for dashboard and settings. | Frontend should use one stats endpoint for both Dashboard home and Settings counts; no getAllUsers for non-admin. |
| **Error/empty states** | Replace silent fallback. | Home: on fetch error or empty categories, show message and optional retry; no mock categories. Category detail: if questions-by-category returns empty, existing empty state is fine. |

---

## 8. Prioritized task backlog

| Task | Product reason | Technical scope | Risk | Priority | Est. difficulty |
|------|----------------|-----------------|------|----------|----------------|
| Add GET questions/by-category | Start Journey and Challenge Repository work. | BE: repo, service, controller, route. FE: verify client URL. | Low | P0 | Small |
| Remove mock categories fallback on home | Honest product; no fake data. | FE: home page; error/empty state. | Low | P1 | Small |
| Align nav links (remove /explore, /community or fix) | No 404s from main nav. | FE: home navbar. | Low | P1 | Small |
| Update siteConfig and misleading copy | Honest messaging. | FE: site.ts, layout, login page. | Low | P1 | Small |
| Add stats endpoint + use in dashboard | Real dashboard numbers. | BE: endpoint, DTO; FE: Dashboard home. | Low | P1 | Small |
| Dashboard home: real recent categories | Real content in dashboard. | FE: fetch categories API, replace hardcoded table. | Low | P1 | Small |
| Settings: no getAllUsers for non-admin; use stats | Avoid 403 for non-admin. | BE: stats returns role-based counts; FE: Settings call stats only. | Low | P1 | Small |
| Footer: remove or disable unimplemented links | No dead or misleading links. | FE: home footer. | Low | P1 | Trivial |
| Add Category.Description (+ migration + DTOs + UI) | Real descriptions on cards and detail. | BE: entity, migration, DTOs; FE: types, forms, display. | Low | P1 | Medium |
| Consolidate subcategory management (redirect) | Single place to manage subcategories. | FE: redirect subcategories → categories; remove sidebar item if any. | Low | P1 | Small |
| Restrict Lookups GetUsers to Admin | Security. | BE: Authorize on controller or action. | Low | P1 | Trivial |
| Rename Domian → Domain | Code quality. | BE: folder, namespaces, references. | Low | P2 | Small |
| Optional: Category.ImageUrl | Editable category images. | BE + FE. | Low | P2 | Medium |
| Optional: “Explore” page as target for Questions link | Valid nav target. | FE: new page or redirect. | Low | P2 | Small |

**Classification:**
- **High priority / low risk:** Add questions-by-category; remove mock fallback; fix nav; honest copy; stats + dashboard + settings; footer; Category.Description; subcategory redirect; Lookups restriction.
- **Medium priority:** Rename Domian; optional ImageUrl; optional Explore page.
- **Future:** Registration, progress, roadmaps, mock interviews, analytics.

---

## 9. Recommended implementation order

Execute in this order for a safe, incremental refactor:

1. **Product truth alignment (no backend):**  
   - Update `siteConfig.description`.  
   - Remove nav links to `/explore` and `/community` (or set “Questions” to `/`).  
   - Remove or disable footer links (Mock Interviews, Roadmaps, About, Contact, Privacy).  
   - Remove mock categories fallback on home; show error/empty state when categories fail.  
   - Optionally adjust “Expert Sign In” and login copy (5,000+ engineers, personalized roadmaps).

2. **Backend: Add GET questions/by-category.**  
   - Add `ByCategoryId` to ApiRoutes.Questions.  
   - Add `GetByCategoryIdAsync` to IQuestionRepository and implementation.  
   - Add `GetByCategoryIdAsync` to IQuestionService and QuestionService.  
   - Add GET action in QuestionsController.  
   - Verify frontend `questionService.getQuestionsByCategory` uses the same path.

3. **Backend: Add stats endpoint.**  
   - Add GET `/api/account/stats` (or `/api/dashboard/stats`) with DTO (categoryCount, questionCount, userCount for Admin).  
   - Implement with existing repos; restrict user count to Admin.  
   - Add route and authorize.

4. **Frontend: Dashboard home.**  
   - Call stats API for all four (or three for non-admin) metrics.  
   - Fetch categories from existing API; show real “Recent Categories” table.  
   - Remove all hardcoded stats and `recentCategories`.

5. **Frontend: Settings page.**  
   - Replace counts logic with stats API only.  
   - Do not call `getAllUsers()` for non-admin (stats returns user count only for Admin).

6. **Backend: Category.Description.**  
   - Add `Description` (nullable string) to Category entity.  
   - Migration.  
   - Add to CategoryResponseDto, CreateCategoryDto, UpdateCategoryDto and service/layer.  
   - Frontend: add to Category type and admin form; display on home and category detail.

7. **Backend: Lookups.**  
   - Add `[Authorize(Roles = "Admin")]` to GetUsers (and any other sensitive lookup) in LookupsController.

8. **Frontend: Subcategory management consolidation.**  
   - Redirect `/dashboard/subcategories` to `/dashboard/categories` (e.g. with tab or hash).  
   - Remove “Subcategories” from dashboard sidebar if it’s a separate item.

9. **Backend: Rename Domian → Domain.**  
   - Rename folder; update namespaces and project references.

10. **Optional:** Add Category.ImageUrl (entity, migration, DTOs, UI).  
11. **Optional:** Add a simple “Explore” or “Browse” page and point “Questions” nav to it.

After this order, the product is aligned with the internal/portfolio MVP, core flows work, and the codebase is ready for future roadmap items (progress, roadmaps, mock interviews, etc.) when you decide to add them.
