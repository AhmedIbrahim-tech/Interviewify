# Authentication & Authorization System — Full-Stack Review

This document is an **analysis-only** review of the current auth system across the .NET backend and Next.js frontend. No implementation changes were made.

---

## 1. Current auth architecture summary

### How authentication currently works

**Backend**
- **Login:** `POST /api/auth/login` (AllowAnonymous) accepts `LoginDto` (email, password). `AuthService.LoginAsync` looks up user by email, verifies password via BCrypt, checks `UserStatus.Active`, generates access JWT and opaque refresh token, stores refresh token in DB, returns `AuthResponseDto` (accessToken, refreshToken, accessTokenExpiration, userName, role, email, profilePicture, id).
- **Access token:** JWT from `JwtTokenService` with claims: `NameIdentifier` (userId), `Email`, `Name` (fullName), `Role`. Signed with symmetric key; validated with `ValidateIssuer`, `ValidateAudience`, `ValidateLifetime`, `ClockSkew = Zero`. Expiry from config `Jwt:ExpiryMinutes` (default 60).
- **Refresh token:** 64 random bytes, Base64, stored in `RefreshTokens` with `UserId`, `ExpirationDate`, `IsRevoked`. Expiry from config `Jwt:RefreshTokenExpiryDays` (default 7).
- **Refresh:** `POST /api/auth/refresh` (AllowAnonymous) with `{ refreshToken }`. Loads token from DB, checks not revoked and not expired, loads user, checks Active, revokes old refresh token, issues new access + new refresh, returns new tokens.
- **Logout:** `POST /api/auth/logout` **[Authorize]** with `{ refreshToken }`. Revokes that refresh token in DB if present. Requires valid JWT in `Authorization` header.

**Frontend**
- **Login:** User submits email/password; `loginUser` thunk calls `authService.login()`; on success Redux stores `user`, `token`, `refreshToken`; `redux-persist` persists `auth` slice to **localStorage** (default key `persist:root`); redirect to `/dashboard`.
- **Token attachment:** Axios request interceptor reads `store.getState().auth.token` and sets `Authorization: Bearer <token>` on every request (store injected via `setStore(store)` in Providers).
- **Refresh on 401:** Response interceptor on 401 (excluding `/auth/login` and `/auth/refresh`) uses a single “isRefreshing” + queue pattern: one refresh request, others wait; on success dispatches `tokenRefreshed`, retries original request; on failure (or no refresh token) dispatches `logout`, hard redirects to `/login`.
- **Logout:** `logoutUser` thunk calls `authService.logout(refreshToken)` (via same axios instance, so Bearer token is sent), catches errors and still dispatches `logout`, clearing persisted state.

### How authorization currently works

**Backend**
- **Global:** No default `[Authorize]`; each controller/action opts in.
- **Account:** `[Authorize]` on entire `AccountController` (profile, change-password, stats). `UserId` from `ClaimTypes.NameIdentifier`. Stats: `userCount` only when `User.IsInRole("Admin")`.
- **Users CRUD:** Entire `UsersController` has `[Authorize(Roles = "Admin")]`.
- **Lookups:** Only `GetUsers` has `[Authorize(Roles = "Admin")]`; roles, categories, sub-categories, statuses are unauthenticated.
- **Categories / SubCategories / Questions:** GETs are `[AllowAnonymous]`; create/update/delete are `[Authorize(Roles = "Admin")]`.
- **Uploads:** `[Authorize]` (any authenticated user).

**Frontend**
- **Route protection:** `/dashboard` layout wraps children in `DashboardAuthGuard`, which allows access only if `state.auth.token` is truthy (after rehydration); otherwise redirects to `/login` and shows spinner until decided.
- **Role-based UI:** `DashboardLayout` hides “Users” nav item unless `user?.role === 'Admin'`. `UserManagementPage` redirects to `/dashboard` if `user && user.role !== 'Admin'` and only fetches users when `user?.role === 'Admin'`.
- **No server-side role check for dashboard routes:** Guard only checks “has token”; role is used for visibility and for redirect on Users page, not for guarding other dashboard routes (e.g. Categories/Questions are visible to all authenticated users, which matches backend).

### How frontend and backend are connected

- **Contract:** Login/refresh return `{ isSuccess, data: { accessToken, refreshToken, accessTokenExpiration, userName, role, email, profilePicture?, id } }`. Frontend `AuthResponseData` and auth slice align with this.
- **Roles:** Backend sends `Role.ToString()` (“Admin” / “User”); frontend compares `user.role === 'Admin'`. Aligned.
- **Auth endpoints:** Frontend calls `/auth/login`, `/auth/refresh`, `/auth/logout` (baseURL is `NEXT_PUBLIC_API_URL` or `https://localhost:7267/api`). Backend routes under `ApiRoutes.Auth` map to same paths.
- **401 handling:** Backend returns 401 for invalid/expired JWT or failed login/refresh. Frontend treats 401 as “try refresh then retry or redirect to login”. No explicit 403 handling in the interceptor (403 is passed through to callers).

---

## 2. Backend auth review

### Strengths

- Clear separation: Auth controller + `IAuthService` + `JwtTokenService` + `RefreshTokenRepository`; password hashing behind `IPasswordHasher` (BCrypt).
- Login validates input (FluentValidation), verifies password, checks `UserStatus.Active`, then issues tokens.
- Refresh token rotation: old token revoked before issuing new one; single-use refresh tokens.
- JWT validation: signing key, issuer, audience, lifetime, zero clock skew.
- Sensitive endpoints protected: Users (Admin only), Account (any authenticated), write operations on Categories/SubCategories/Questions (Admin only), Uploads (authenticated).
- Public read access is explicit (`[AllowAnonymous]` on GETs for categories, subcategories, questions).
- Account controller uses `UserId` from claims and `User.IsInRole("Admin")` for stats; no raw user id from client.
- DTOs: no password in responses; `AuthResponseDto` and `RefreshTokenRequestDto` are minimal.

### Weaknesses

- **Logout requires [Authorize]:** Logout endpoint needs a valid JWT. If the access token is already expired, the request returns 401 before reaching the controller, so the refresh token is never revoked. Client still clears state and redirects, but the refresh token remains valid until it expires or is used once (then rotated). So “logout” with expired access token does not revoke server-side.
- **AccessTokenExpiration in DTO is hardcoded:** `AuthService` uses `DateTime.UtcNow.AddMinutes(60)` for `AccessTokenExpiration` in both login and refresh responses. Actual JWT expiry comes from `JwtSettings.ExpiryMinutes` in `JwtTokenService`. If config changes (e.g. 30 minutes), the DTO would still say 60 minutes. Frontend does not use this value for proactive refresh, so impact is limited but inconsistent.
- **AccountController UserId fallback:** `UserId => int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0")`. If the claim were missing (e.g. misconfiguration), `0` would be used and could lead to wrong or invalid behavior. Low risk with correct JWT setup.
- **LookupsController route:** Uses `[Route("api/[controller]")]` so path is `api/Lookups` (capital L). Frontend uses `/lookups/...`. ASP.NET Core routing is typically case-insensitive; worth confirming in deployment.

### Security issues

- None critical. Token storage (see frontend) is the main residual risk.

### Missing protections

- **Logout when access token expired:** Cannot revoke refresh token from client when JWT is expired unless logout is callable without a valid JWT (e.g. AllowAnonymous and validate only the refresh token in the body).
- **Rate limiting:** No rate limiting on login/refresh visible; brute-force and refresh abuse could be mitigated later.

### DTO/endpoint issues

- **AuthResponseDto:** `AccessTokenExpiration` is `DateTime`; serialized as ISO string to frontend. Type is fine.
- **RefreshTokenRequestDto:** Single property `RefreshToken`; validators ensure not empty. Good.

### Architectural issues

- **AuthService and JwtSettings:** AuthService does not inject `IOptions<JwtSettings>` and uses hardcoded 60 for the DTO; small duplication of “token lifetime” concept.

---

## 3. Frontend auth review

### Strengths

- Single source of auth state in Redux (`auth` slice); persisted so refresh/reload keeps session.
- Request interceptor consistently attaches Bearer token from store.
- 401 handling with refresh queue avoids multiple simultaneous refresh calls and retries failed requests with the new token.
- Dashboard guard prevents rendering protected content until “has token” is confirmed and redirects unauthenticated users to `/login`.
- Role-based nav (Users link only for Admin) and UserManagementPage redirect for non-Admin align with backend.
- Login flow: validation, loading state, error toast, redirect on success.
- Logout: attempts server logout with refresh token, always clears client state and redirects (catch block ignores errors).

### Weaknesses

- **Token storage in localStorage:** Entire `auth` slice (including access and refresh tokens) is in localStorage via redux-persist. localStorage is accessible to same-origin script (XSS). If an XSS exists, tokens can be stolen. HttpOnly cookies for refresh token would reduce that risk; access token in memory only is harder to steal. For many MVPs this is accepted; for higher security it’s a known weakness.
- **No proactive token refresh:** Frontend does not use `accessTokenExpiration` to refresh before expiry; only reacts to 401. Users may hit 401 on first request after expiry, then refresh; acceptable but can cause a short delay or extra failure if refresh is slow.
- **Guard only checks token presence:** Dashboard guard does not validate that the token is still valid; it only checks “token exists”. Expired token leads to 401 on first API call, then refresh or redirect. So there is a brief “allowed in” then possible redirect after first request—acceptable but not “validate then show.”
- **Login page does not redirect if already authenticated:** Visiting `/login` while logged in shows the form; no “already logged in → redirect to dashboard.” Minor UX.
- **PersistGate loading={null}:** While rehydrating, PersistGate renders `null`, so no loading UI. Users may see a blank or partial screen until rehydration completes and guard runs.

### Auth state issues

- **Rehydration order:** Guard runs in an effect that depends on `token`. If persist has not rehydrated yet, `token` is null and guard redirects to `/login` even when a valid session exists in storage. Redux-persist rehydration is async; the guard may run before rehydration. This can cause “logged-in user sent to login on refresh” if the timing is wrong. Need to ensure guard waits for rehydration (e.g. check `persistGate` / rehydration state) before treating “no token” as unauthenticated.
- **Double logout dispatch:** In `DashboardLayout.handleSignOut`, code does `await dispatch(logoutUser()); dispatch(logout());`. `logoutUser.fulfilled` already clears state (logout reducer). The extra `dispatch(logout())` is redundant; harmless but noisy.

### Route/page protection issues

- **Only dashboard is guarded:** Routes under `/dashboard` use `DashboardAuthGuard`. `/login` is not protected (anyone can open it). Public routes (e.g. `/`, `/category/[id]`) have no auth requirement. This matches the intended design.
- **UserManagementPage:** Correctly redirects non-Admin to `/dashboard` and only fetches users for Admin. Backend would return 403 if a non-Admin called the API; frontend avoids the call.

### UX issues

- **No “already logged in” redirect on login page.**
- **403 from API:** If a user manipulates the app and triggers an Admin-only API call, they get 403. There is no global 403 handler (e.g. “You don’t have permission” + redirect). Caller sees the error; acceptable for MVP.
- **Error message on login:** `err.response?.data?.message` or generic “Invalid credentials”; backend can return “User account is inactive.”—good.

### Technical issues

- **Refresh uses raw axios:** The interceptor uses `axios.post(...)` to the same URL with `api.defaults.baseURL` instead of using the shared `authService.refresh`. That avoids attaching the expired Bearer to the refresh request (correct) but duplicates the URL and contract; minor maintainability issue.
- **authSlice AuthUser.id:** Typed as `id?: any`; could be `number` to match API.

---

## 4. Auth integration review

### What is aligned

- Login/refresh request and response shapes (tokens, user fields, role).
- Role values (“Admin”, “User”) and use in nav and UserManagementPage.
- Auth endpoints paths and usage (login, refresh, logout).
- 401 triggers refresh then retry or redirect; no token sent to login/refresh.
- Backend Admin-only vs frontend “Users” visibility and UserManagementPage redirect.

### What is mismatched

- **AccessTokenExpiration:** Backend may send a different expiry than actual JWT if config changes; frontend doesn’t use it, so no functional mismatch.
- **Logout when token expired:** Backend expects valid JWT for logout; client may call logout when token is already expired (e.g. after long idle). Result: 401 → client tries refresh; if refresh succeeds, retry is the logout request (with new token), so the *new* refresh token gets revoked. Old refresh token is not revoked. So “logout” with expired access token does not revoke the refresh token the user had before.

### What is fragile

- **Rehydration vs guard:** If the guard runs before persist rehydration, a logged-in user could be sent to login on full page reload. Depends on order of PersistGate → children → guard effect and rehydration timing.
- **Logout endpoint design:** Tied to valid JWT; limits “revoke this refresh token” when the client only has an expired JWT.

### What needs improvement

- Ensure dashboard guard does not treat “no token” as unauthenticated until rehydration has completed (or explicitly decided there is no persisted session).
- Optionally allow logout without JWT (e.g. AllowAnonymous, body with refreshToken only) so refresh token can always be revoked.
- Unify access token expiry: either use config in AuthService for the DTO or document that frontend ignores it.

---

## 5. Authentication findings

- **Login:** Implemented correctly: validation, password check, status check, tokens, persistence, redirect. No missing fields.
- **Logout:** Works when access token is valid (refresh token revoked). When access token is expired, server-side revocation of the *current* refresh token does not happen; client still clears state and redirects.
- **Refresh:** Implemented correctly: single refresh in flight, queue, retry, revoke old refresh token, issue new pair. Frontend uses raw axios and correct URL; no Bearer on refresh request.
- **Token/session handling:** Access token in memory (Redux) and persisted to localStorage. Refresh token same. Both attached via interceptor. Session is “valid until 401 then refresh or redirect.” Main risk is XSS and localStorage (see Security).

---

## 6. Authorization findings

- **Roles:** Backend uses `ClaimTypes.Role` and `[Authorize(Roles = "Admin")]`; frontend uses `user.role === 'Admin'`. Aligned.
- **Protected endpoints:** Users CRUD and Lookups/GetUsers are Admin-only; Account is any authenticated; Categories/SubCategories/Questions write are Admin-only; Uploads any authenticated. GETs for content are anonymous. No obvious gap.
- **Protected pages:** Dashboard requires token (guard). Users page additionally restricts by role and redirects non-Admin. No backend call for “list users” without Admin, so 403 is not relied on for that flow.
- **Weak spots:** None critical. Account controller’s `UserId` fallback to 0 is theoretical only with correct JWT.

---

## 7. Libraries and patterns review

### What is currently used

- **Backend:** ASP.NET Core `Microsoft.AspNetCore.Authentication.JwtBearer`, `Microsoft.IdentityModel.Tokens`, `System.IdentityModel.Tokens.Jwt` for JWT; BCrypt.Net-Next for password hashing; EF Core for refresh token storage; FluentValidation for login/refresh DTOs.
- **Frontend:** Axios for HTTP; Redux + Redux Toolkit for state; redux-persist with localStorage for persistence; no dedicated auth library (custom interceptors and slice).

### What is good

- JWT Bearer is standard and correctly configured (signing, issuer, audience, lifetime).
- BCrypt is appropriate for password hashing.
- Redux + persist gives a single auth state and survives reload; interceptors keep the client simple.
- No heavy auth framework on the frontend; behavior is explicit and auditable.

### What is weak

- **redux-persist + localStorage:** Persisting tokens to localStorage is a common but XSS-sensitive choice. For higher security, consider HttpOnly cookie for refresh and short-lived access token in memory (or similar).
- **No proactive refresh:** Relying only on 401 is fine but can be improved with a timer using `accessTokenExpiration` (and fixing backend to send correct value).

### What should stay

- Backend: JWT Bearer, BCrypt, FluentValidation, refresh token in DB with rotation.
- Frontend: Redux auth slice, axios interceptors, guard pattern. No need to introduce a large auth SDK unless requirements grow.

### What could be replaced and why

- **Token storage:** Replace “persist tokens in localStorage” with “refresh in HttpOnly cookie, access in memory” only if you need to reduce XSS impact and are ready to change backend (cookies, CORS, same-site). Not required for current MVP.
- **Proactive refresh:** Could add a timer/task that calls refresh before expiry using the expiration from the API (once backend sends the correct value). Improves UX, not strictly required.

---

## 8. Security and risk review

| Risk | Severity | Why it matters |
|------|----------|----------------|
| Tokens in localStorage | Medium | XSS could steal tokens; HttpOnly cookie for refresh would reduce exposure. |
| Logout with expired token does not revoke refresh token | Low | Refresh token remains valid until expiry or next use; session is still cleared on client. |
| No rate limiting on login/refresh | Low | Brute-force and refresh abuse possible; can be added at gateway or app level. |
| Guard may run before rehydration | Medium | Could log out valid sessions on reload if timing is wrong; needs rehydration-aware guard. |
| AccountController UserId "0" fallback | Low | Only if JWT claim is missing; unlikely with correct config. |

No critical vulnerabilities identified; the most impactful improvements are token storage strategy and rehydration-aware guard.

---

## 9. Prioritized improvement list

### Critical

- **Rehydration before guard:** Ensure dashboard auth guard does not redirect to login until Redux-persist rehydration has completed (or has determined there is no persisted auth). Otherwise authenticated users may be sent to login on full page reload.

### Important

- **Logout without valid JWT:** Consider allowing `POST /api/auth/logout` with AllowAnonymous, accepting only `{ refreshToken }` in the body, and revoking that token. This allows “revoke my refresh token” even when the access token is already expired.
- **AccessTokenExpiration consistency:** In AuthService, use `IOptions<JwtSettings>` and use `ExpiryMinutes` (or the same value used by JwtTokenService) when building `AccessTokenExpiration` in login/refresh responses, so frontend could use it later for proactive refresh.
- **Document or reduce token storage risk:** If keeping localStorage, document the XSS assumption and hardening (CSP, etc.). If security requirements increase, plan for refresh in HttpOnly cookie and access token in memory.

### Nice to improve later

- **Login redirect when already authenticated:** If `token` exists and user visits `/login`, redirect to `/dashboard`.
- **Proactive refresh:** Use `accessTokenExpiration` (once correct) to refresh shortly before expiry to reduce 401-then-refresh latency.
- **Remove redundant dispatch(logout())** in `DashboardLayout.handleSignOut`.
- **403 handling:** Optional global handler for 403 (e.g. toast + redirect) for better UX when a user hits an Admin-only endpoint.
- **Rate limiting:** Add rate limiting for `/auth/login` and `/auth/refresh` where the app is deployed.

---

## 10. Recommended next implementation scope

### Fix first

1. **Rehydration-aware dashboard guard**  
   Do not treat “no token” as unauthenticated until persist has rehydrated (e.g. use a “rehydration done” flag or PersistGate’s `onBeforeLift` / children render only after rehydration). This prevents false redirects to login on refresh.

2. **Optional but recommended: logout without JWT**  
   Allow anonymous POST to logout with only `refreshToken` in body; revoke that token. Keeps behavior correct when access token is already expired.

### Leave for later

- Proactive refresh, login-page redirect when authenticated, global 403 handling, rate limiting.
- Moving refresh token to HttpOnly cookie (requires backend and CORS/same-site design).

### Do not change unnecessarily

- JWT structure, claim names, or role values (they are aligned).
- Overall flow of “401 → refresh → retry or redirect” or the refresh queue.
- Backend authorization attributes (they match the intended model).
- Redux auth slice shape or persistence of the whole auth slice, unless you move to a different storage strategy.

---

*End of analysis. No code changes were made; this document is for planning only.*
