# Interviewify Theme System

## Overview

Unified, eye-friendly light/dark theme with **your target palette**. No pure black; layered navy/slate in dark mode. One brand accent (blue-violet/indigo), soft semantic colors, soft shadows. Theme class on `<html>` (`light` / `dark`), persisted in `localStorage` as `interviewify-theme`.

---

## 1. Token structure

Defined in `src/app/globals.css`: `:root` (light) and `.dark` (dark).

### Light mode (target palette)

| Token | Value | Purpose |
|-------|--------|--------|
| **Foundation** | | |
| `--background` | #F8FAFC | Page/body |
| `--background-secondary` | #F1F5F9 | Footer, sections |
| `--surface` | #FFFFFF | Panels, inputs |
| `--surface-elevated` | #FFFFFF | Hover, dropdowns, table header |
| `--card` | #FFFFFF | Cards, modals |
| `--sidebar` | #FFFFFF | Dashboard sidebar |
| `--navbar` | #FFFFFF | Top bar |
| `--input` | #FFFFFF | Input background |
| `--border` | #E2E8F0 | Default border |
| **Text** | | |
| `--primary-text` | #0F172A | Headings, body |
| `--secondary-text` | #475569 | Supporting |
| `--muted-text` | #64748B | Placeholders, captions |
| **Brand** | | |
| `--accent` | #6366F1 | Primary actions, links |
| `--accent-hover` | #4F46E5 | Hover |
| `--accent-soft` | #EEF2FF | Badges, active nav |
| **Semantic** | | |
| `--success` / `--success-soft` | #10B981 / #ECFDF5 | Success |
| `--warning` / `--warning-soft` | #F59E0B / #FFFBEB | Warning |
| `--danger` / `--danger-soft` / `--danger-hover` | #EF4444 / #FEF2F2 / #DC2626 | Error, destructive |
| `--info` / `--info-soft` | #0EA5E9 / #F0F9FF | Info |

### Dark mode (layered navy, no pure black)

| Token | Value | Purpose |
|-------|--------|--------|
| `--background` | #0B1120 | Page |
| `--background-secondary` | #111827 | Sections |
| `--surface` | #0F172A | Panels |
| `--surface-elevated` | #162033 | Hover, dropdowns |
| `--card` | #111C2E | Cards, modals |
| `--sidebar` | #0B1220 | Sidebar |
| `--navbar` | #0E1728 | Top bar |
| `--input` | #111C2E | Input |
| `--border` | #22314A | Borders |
| `--primary-text` | #E5EEF9 | Headings, body |
| `--secondary-text` | #B6C2D2 | Supporting |
| `--muted-text` | #8A97A8 | Muted |
| `--accent` | #7C86FF | Primary |
| `--accent-hover` | #6366F1 | Hover |
| `--accent-soft` | #1E293B | Soft accent bg |
| Semantic | As specified | success/warning/danger/info + -soft |

### Other tokens

- `--accent-foreground`: #FFFFFF — text on accent buttons/badges (both themes)
- `--overlay`: modal/backdrop (light: rgb(0 0 0 / 0.35), dark: rgb(0 0 0 / 0.5)) — no pure black
- `--focus-ring`: accent (focus outline)
- `--shadow-sm`, `--shadow-md`, `--shadow-lg`, `--shadow-card`: soft elevation
- `--hover-overlay`, `--active-overlay`: interactive overlays
- `--radius-sm` … `--radius-full`: border radius

Legacy aliases: `--bg-body`, `--bg-card`, `--bg-sidebar`, `--bg-topbar`, `--text-primary`, `--primary`, `--primary-hover`, `--primary-light`, `--border-color`, `--input-border`, `--success-light`, etc. map to the above.

### Tailwind @theme inline

`globals.css` exposes all semantic tokens to Tailwind v4 via `@theme inline` (e.g. `--color-background`, `--color-accent`, `--color-success-soft`, `--color-overlay`, etc.) so utilities like `bg-background`, `text-accent` are available if needed. Components primarily use `var(--token)` in class names for clarity.

---

## 2. Files changed

| File | Changes |
|------|--------|
| **globals.css** | Full light/dark palette; added `--accent-foreground`, `--overlay`; expanded `@theme inline` with all semantic colors for Tailwind; selection uses `--accent-foreground`. |
| **LoginPage.tsx** | Divider/label: `bg-[#fafafa]`, `text-gray-400`, `border-gray-200` → `--background-secondary`, `--muted-text`, `--border`; link `text-indigo-600` → `--accent`. |
| **SettingsPage.tsx** | Social buttons: removed hardcoded brand hexes (#1877F2, #1DA1F2, etc.); unified `--surface-elevated`, `--border`, `--muted-text`, hover: `--accent-soft`, `--accent`. |
| **CategoryManagementPage.tsx** | Overlays `bg-black/40` → `--overlay`; dividers `bg-gray-100` → `--border-light`; cards `bg-white` → `--card`; status widgets blue/emerald → `--info-soft`/`--success-soft`. |
| *(SubCategoryManagementPage removed; management is under Categories & Modules.)* | — |
| **QuestionManagementPage.tsx** | Category pill blue-50/blue-600 → `--info-soft`/`--info`; stat cards emerald/amber/purple → success/warning/accent tokens; view modal status box → `--success-soft`/`--warning-soft`; overlay → `--overlay`; fixed typo `text-[var(--text-muted)]200`. |
| **UserManagementPage.tsx** | Overlay → `--overlay`; avatar placeholder `bg-indigo-500` → `--accent`; stat icons emerald/purple → `--success-soft`/`--accent-soft`. |
| **DashboardLayout.tsx** | Mobile sidebar overlay `bg-black/30` → `--overlay`. |
| **CategoryCard.tsx** | Already token-based (single accent family). |
| **StatusBadge.tsx** | Already semantic (success/warning/danger/info/primary). |

---

## 3. Where hardcoded colors were replaced

- **Auth:** LoginPage – divider background, label, border, footer text and link → `--background-secondary`, `--muted-text`, `--border`, `--accent`.
- **Dashboard:** SettingsPage – social icon buttons (Facebook/Twitter/YouTube/Instagram hexes) → unified surface + accent hover.
- **Dashboard:** CategoryManagementPage – modal overlays, section dividers, card backgrounds, status/info widgets → `--overlay`, `--border-light`, `--card`, `--info-soft`/`--success-soft`.
- **Dashboard:** SubCategory management is under CategoryManagementPage (Categories & Modules); no separate SubCategoryManagementPage.
- **Dashboard:** QuestionManagementPage – category pills, stat card icons (emerald/amber/purple), view modal category pill and status block, overlay → info/success/warning/accent tokens, `--overlay`.
- **Dashboard:** UserManagementPage – overlay, avatar fallback, stat icons → `--overlay`, `--accent`, `--success-soft`/`--accent-soft`.
- **Dashboard:** DashboardLayout – mobile overlay → `--overlay`.
- **Modals:** All `bg-black/40` or `bg-black/30` backdrops → `--overlay` (no pure black).
- **Metric/stat widgets:** Blue/emerald/purple/amber raw Tailwind → `--info`, `--success`, `--accent`, `--warning` and their `-soft` backgrounds.

---

## 4. UI areas normalized

- **App/page backgrounds:** --background everywhere (no pure black).
- **Sections:** --background-secondary where needed.
- **Cards / elevated cards:** --card, --surface-elevated, --shadow-card / --shadow-lg.
- **Sidebars:** --sidebar, --border-color.
- **Top navbars:** --navbar, --border-color.
- **Buttons:** Primary = --accent, --accent-hover; secondary = --surface-elevated, --border-color.
- **Badges / pills:** StatusBadge already semantic; CategoryCard/CategoryDetails use --accent-soft, --accent.
- **Tables:** Headers/rows use --surface-elevated, --border-light.
- **Inputs / search:** --input, --input-border, --text-primary, --text-muted.
- **Filters / tabs:** Token-based surfaces and borders.
- **Metric/stat widgets:** Use --card, --border-color, status tokens.
- **Footers:** --background-secondary, --border-color, --muted-text.
- **Hover / active / focus:** --surface-elevated, --accent, --focus-ring; overlays use --hover-overlay/--active-overlay where defined.
- **Modal/backdrop overlays:** --overlay (no pure black).
- **Text on accent (buttons, badges):** --accent-foreground.

---

## 5. Recommendations

1. **New UI:** Use only semantic tokens (e.g. `bg-[var(--card)]`, `text-[var(--primary-text)]`, `border-[var(--border-color)]`). No new hex or gray-* for theme-dependent UI.
2. **Buttons on accent:** Prefer `text-[var(--accent-foreground)]` for text on accent buttons so the token can be tuned globally.
3. **Consistency:** Keep one main accent; use semantic colors only for status (success/warning/danger/info), not decoration.
4. **Accessibility:** Check contrast for --primary-text on --background and --card in both themes.
5. **Shadows:** Keep using --shadow-sm/md/lg/card; avoid ad-hoc rgba shadows for surfaces.
6. **Overlays:** Use `bg-[var(--overlay)]` for modal/backdrop so dark mode never uses pure black.
