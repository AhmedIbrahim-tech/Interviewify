# Interviewify – Authentication and API Communication Technical Report

This report describes how authentication and API communication are implemented in the Interviewify solution (.NET API + Next.js Client), and highlights issues that can cause API requests to fail due to missing or incorrect auth configuration.

---

## 1. Authentication Architecture

### Backend (.NET)

- **Startup**: No `Startup.cs`; configuration is in `Program.cs` only.
- **AddAuthentication**: Present. JWT Bearer is the only scheme.

**Program.cs** (excerpt):

```40:58:API/Program.cs
var jwtKey = builder.Configuration["Jwt:Key"] ?? throw new InvalidOperationException("Jwt:Key not configured.");
var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = key,
            ValidateIssuer = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidateAudience = true,
            ValidAudience = builder.Configuration["Jwt:Audience"],
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };
    });
builder.Services.AddAuthorization();
```

- **Signing key**: From `appsettings.json` → `Jwt:Key` (SymmetricSecurityKey, UTF-8 bytes).
- **Issuer / Audience**: From config; both validated.
- **TokenValidationParameters**: Signing key, issuer, audience, and lifetime validated; `ClockSkew = TimeSpan.Zero`.

**Middleware order** in `Program.cs`:

```70:75:API/Program.cs
app.UseHttpsRedirection();
app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
```

Order is correct: CORS → Authentication → Authorization → Controllers.

**DependencyInjection**: Auth is not registered in `Application` or `Infrastructure` DI; it is configured only in `API/Program.cs`. `Application` registers `IAuthService` → `AuthService`; `Infrastructure` registers `ITokenService` → `JwtTokenService` and `IOptions<JwtSettings>` from config.

**appsettings.json** (JWT section):

```12:17:API/appsettings.json
  "Jwt": {
    "Key": "YourSecretKeyForInterviewifyProductionReplaceWithSecureValueMin32Chars",
    "Issuer": "Interviewify",
    "Audience": "Interviewify",
    "ExpiryMinutes": 60,
    "RefreshTokenExpiryDays": 7
  },
```

---

## 2. Token Generation

- **Where**: Access tokens are created in `Infrastructure/Services/JwtTokenService.cs`; login/refresh flows use it via `Application/Features/Auth/AuthService.cs`.
- **Login endpoint**: `POST api/auth/login` (AuthController, `[AllowAnonymous]`).
- **Claims in JWT**: `NameIdentifier` (userId), `Email`, `Name` (fullName), `Role`. Algorithm: `HmacSha256`.

**JwtTokenService.cs** (access token):

```19:37:Infrastructure/Services/JwtTokenService.cs
    public string GenerateAccessToken(int userId, string email, string fullName, string role)
    {
        var key = new SymmetricSecurityKey(System.Text.Encoding.UTF8.GetBytes(_settings.Key));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
            new Claim(ClaimTypes.Email, email),
            new Claim(ClaimTypes.Name, fullName),
            new Claim(ClaimTypes.Role, role)
        };
        var token = new JwtSecurityToken(
            issuer: _settings.Issuer,
            audience: _settings.Audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(_settings.ExpiryMinutes),
            signingCredentials: creds);
        return new JwtSecurityTokenHandler().WriteToken(token);
    }
```

- **Expiration**: From `Jwt:ExpiryMinutes` (60). Refresh tokens use `Jwt:RefreshTokenExpiryDays` (7).
- **Refresh**: `POST api/auth/refresh` with body `{ "refreshToken": "..." }` returns a new access token and refresh token.

---

## 3. Token Storage

- **Where**: Frontend stores auth state in Redux; the `auth` slice is persisted with `redux-persist` to **localStorage** under key `persist:root`.
- **What is stored**: Redux state for the `auth` slice: `user`, `token`, `isAuthenticated`, `loading`, `error`. The axios client does **not** read a separate store; it derives the token from the persisted Redux state by parsing `localStorage.getItem('persist:root')` and then `auth.token`.

**Client store persistence** (`Client/src/store/index.ts`):

```16:21:Client/src/store/index.ts
const persistConfig = {
    key: 'root',
    version: 1,
    storage,
    whitelist: ['auth'], // Only persist 'auth' slice
};
```

**Auth slice state** (`Client/src/store/slices/authSlice.ts`):

```3:16:Client/src/store/slices/authSlice.ts
interface AuthState {
    user: null | { id: string; name: string; email: string };
    token: string | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
}

const initialState: AuthState = {
    user: null,
    token: null,
    isAuthenticated: false,
    ...
};
```

- **Critical**: The backend returns `AuthResponseDto` with `AccessToken`, `RefreshToken`, `UserName`, `Role` (serialized camelCase: `accessToken`, `refreshToken`, `userName`, `role`). The API response body is `ApiResult<AuthResponseDto>` (e.g. `{ isSuccess, data, message, errors }`). The frontend must store `data.accessToken` as `token` and build `user` from `data.userName` / `data.role` (and id/email if added). If the login flow stores something else (e.g. full `response.data` or `data.token`), `auth.token` can be `undefined` and no Bearer header is sent (see Section 4 and Section 9).

---

## 4. Authorization Header Handling

- **Mechanism**: A single axios instance in `Client/src/config/api.ts` with a **request interceptor** that sets `Authorization: Bearer <token>` when a token is present in the persisted auth state.

**Client/src/config/api.ts**:

```1:28:Client/src/config/api.ts
import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://localhost:7267/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to include auth token
api.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            const persistRoot = localStorage.getItem('persist:root');
            if (persistRoot) {
                const auth = JSON.parse(JSON.parse(persistRoot).auth);
                const token = auth.token;
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;
```

- **Base URL**: `process.env.NEXT_PUBLIC_API_URL` or `https://localhost:7267/api`.
- **When the header is set**: Only in the browser (`typeof window !== 'undefined'`), and only if `auth.token` exists in the persisted state. All requests that go through this axios instance (e.g. `authService`, `categoryService`) get the header when those conditions are met.
- **Format**: `Authorization: Bearer <token>` (correct for JWT Bearer).

If `auth.token` is never set (e.g. due to login payload/shape mismatch), no request will send the Bearer token and all protected endpoints will return 401.

---

## 5. Backend Token Validation

- **Scheme**: JwtBearer; no custom events (e.g. no custom OnMessageReceived).
- **TokenValidationParameters**: As in Section 1 (signing key, issuer, audience, lifetime, zero clock skew). Default behavior: token is read from `Authorization: Bearer <token>`.
- **CORS**: Default policy allows any origin, any method, any header, so `Authorization` is allowed. No extra CORS configuration needed for the header.

---

## 6. CORS Configuration

**Program.cs**:

```28:36:API/Program.cs
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});
```

- **Allowed origins**: Any.
- **Allowed methods**: Any.
- **Allowed headers**: Any (includes `Authorization`).
- **Middleware**: `app.UseCors()` is applied before `UseAuthentication`/`UseAuthorization`.

---

## 7. Key Files Responsible

| Area | File(s) |
|------|--------|
| Auth registration & validation | `API/Program.cs` |
| JWT config | `API/appsettings.json` |
| Token generation | `Infrastructure/Services/JwtTokenService.cs`, `Application/Features/Auth/AuthService.cs` |
| Login/refresh/logout endpoints | `API/Controllers/AuthController.cs` |
| Route names | `API/Routes/ApiRoutes.cs` |
| Axios instance & Bearer header | `Client/src/config/api.ts` |
| Auth state & persistence | `Client/src/store/slices/authSlice.ts`, `Client/src/store/index.ts` |
| Login flow | `Client/src/features/auth/pages/LoginPage.tsx`, `Client/src/services/authService.ts` |
| API usage | `Client/src/services/categoryService.ts`, `Client/src/services/authService.ts` |

---

## 8. Endpoint Security (Protected vs Public)

| Endpoint | Method | Protection |
|----------|--------|------------|
| `api/auth/login` | POST | **Public** (`[AllowAnonymous]`) |
| `api/auth/refresh` | POST | **Public** (`[AllowAnonymous]`) |
| `api/auth/logout` | POST | **Protected** (`[Authorize]`) |
| `api/categories` | GET | **Public** (`[AllowAnonymous]`) |
| `api/categories/{id}` | GET | **Public** (`[AllowAnonymous]`) |
| `api/categories` | POST | **Admin** (`[Authorize(Roles = "Admin")]`) |
| `api/categories/{id}` | PUT, DELETE | **Admin** |
| `api/subcategories/by-category/{categoryId}` | GET | **Public** |
| `api/subcategories` | POST | **Admin** |
| `api/subcategories/{id}` | PUT, DELETE | **Admin** |
| `api/questions/by-subcategory/{subCategoryId}` | GET | **Public** |
| `api/questions/{id}` | GET | **Public** |
| `api/questions` | POST | **Admin** |
| `api/questions/{id}` | PUT, DELETE | **Admin** |
| `api/users/*` | All | **Admin** (controller-level `[Authorize(Roles = "Admin")]`) |

No minimal APIs or route groups with `.RequireAuthorization()` were found; all protection is via `[Authorize]` / `[AllowAnonymous]` on controllers/actions.

---

## 9. Full Request Lifecycle

1. **Request creation**  
   Component or thunk calls a service (e.g. `categoryService.getAllCategories()` or `authService.login()`). The service uses the shared axios instance from `Client/src/config/api.ts`.

2. **Header injection**  
   Axios runs the request interceptor. If `window` is defined, it reads `localStorage.getItem('persist:root')`, parses the persisted state, gets `auth.token`. If `token` is truthy, it sets `config.headers.Authorization = 'Bearer ' + token`. Otherwise, no Authorization header is set.

3. **CORS**  
   Browser sends the request (with or without Authorization). The API’s CORS middleware responds with Allow-Any-Origin/Method/Header, so the browser allows the response to be read.

4. **Backend authentication**  
   For protected routes, ASP.NET Core JWT Bearer middleware reads `Authorization: Bearer <token>`, validates signature, issuer, audience, and lifetime, and populates `HttpContext.User` (claims principal). If the header is missing or invalid, the request is unauthenticated (and typically 401 after authorization).

5. **Authorization**  
   `[Authorize]` / `[Authorize(Roles = "Admin")]` run. If the user is not authenticated or lacks the required role, the pipeline short-circuits with 401/403.

6. **Endpoint execution**  
   Controller action runs and returns the response.

---

## 10. Possible Problems or Missing Configuration

### High impact (can cause API/auth failures)

1. **Login response shape vs Redux and interceptor**  
   - Backend returns `ApiResult<AuthResponseDto>` with `Data` = `{ accessToken, refreshToken, accessTokenExpiration, userName, role }` (camelCase).  
   - Frontend `authSlice` expects `loginSuccess({ user, token })` and the interceptor uses `auth.token`.  
   - `LoginPage` dispatches `loginSuccess(response.data)`, i.e. the whole `ApiResult` (`isSuccess`, `data`, `message`), not `response.data.data`. So `action.payload.token` and `action.payload.user` are undefined, and **the access token is never stored**. The interceptor never finds `auth.token`, so **no request sends the Bearer header** and all protected calls (categories POST/PUT/DELETE, users, logout) get 401.  
   - **Fix**: Map login response to the shape the slice expects, e.g.  
     - `token` ← `response.data.data.accessToken` (or equivalent if your `ApiResponse` type wraps it).  
     - `user` ← object built from `userName`, `role`, and id/email if available.  
     Dispatch `loginSuccess({ user, token })` with that mapping and ensure only this axios instance is used for API calls so the interceptor always runs.

2. **Logout body**  
   - Backend `AuthController.Logout` expects `[FromBody] RefreshTokenRequestDto dto` (i.e. `{ refreshToken: "..." }`).  
   - Frontend calls `api.post('/auth/logout')` with no body, so the backend may not receive the refresh token and refresh tokens might not be revoked.  
   - **Fix**: Pass the current refresh token in the request body and (if needed) read it from the same place you persist it (e.g. from auth state or a dedicated refreshToken field in the auth slice).

3. **SSR / missing token**  
   - The interceptor only runs when `typeof window !== 'undefined'`. Server-side or pre-hydration requests will never attach the token. If any API call is made during SSR using this client, it will be unauthenticated.  
   - **Fix**: Only call protected APIs from the client (e.g. in `useEffect` or after redirect to client), or provide a server-side token mechanism and a separate server axios instance that does not rely on `localStorage`.

### Medium / lower impact

4. **No refresh on 401**  
   - There is no response interceptor that catches 401 and tries `POST api/auth/refresh` then retries the request. Expired access tokens will cause immediate failure.  
   - **Fix**: Add a response interceptor that on 401 (and optionally only for certain paths) calls refresh, stores the new token, and retries the original request; otherwise redirect to login.

5. **Refresh token not persisted**  
   - Backend returns `refreshToken` but the frontend auth slice only stores `token` (access token). Refresh cannot be used after reload without re-login.  
   - **Fix**: Add `refreshToken` to the auth slice and persist it, then use it in the 401 interceptor and for logout body.

6. **JWT key in appsettings**  
   - Production secret is in `appsettings.json`. Prefer environment variables or a secret store and ensure `Jwt:Key` is set there.

7. **Frontend auth type vs backend**  
   - `authService.ts` defines `AuthResponse` with `user: { id, name, email, roles }` and `token`, but the API returns `accessToken`, `refreshToken`, `userName`, `role`. Align types and mapping to avoid subtle bugs and to support the interceptor and refresh flow.

---

## Summary

- **Backend**: JWT Bearer is correctly configured in `Program.cs` (signing key, issuer, audience, lifetime); middleware order is correct; CORS allows the `Authorization` header.
- **Frontend**: A single axios instance with a request interceptor is used to add `Authorization: Bearer <token>` from persisted Redux auth state.
- **Main risk**: The access token is likely never stored because the login response shape and the payload passed to `loginSuccess` do not match what the auth slice and interceptor expect. Fixing the login mapping so `auth.token` is set from `data.accessToken` (and aligning logout and optional refresh flow) is essential for protected API requests to succeed.
