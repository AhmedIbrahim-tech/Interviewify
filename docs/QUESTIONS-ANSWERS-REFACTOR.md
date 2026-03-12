# Questions / Answers Module — Refactor Summary (Bilingual + Markdown + Code)

## 1. Review summary

### What was wrong with the current Answers experience

**For admins**
- Only one answer field: no clear way to provide both English and Arabic.
- Single plain textarea: no structure (headings, paragraphs, code), so long answers were one blob.
- Code in answers appeared as plain text; no formatting or code blocks.
- Table expanded row and view modal showed raw text with `whitespace-pre-wrap` only — no markdown, no code styling, cramped and hard to read.
- No hint that content could be structured (e.g. markdown/code fences).

**For end users**
- Answer was one text blob; no clear separation of English vs Arabic.
- Code snippets appeared as plain text, no monospace or block styling.
- Typography and hierarchy were weak; answers did not feel structured or premium.
- RTL for Arabic was not applied.

**Root causes**
- Model had a single `Answer` string; no bilingual support.
- No markdown or structured format: backend and frontend treated content as plain text.
- No code-block rendering: no component to render markdown/code fences.

---

## 2. Domain/model decision

### How answers are modeled now

- **Question** has two answer fields:
  - **Answer** (string, required in DB): English answer. Supports Markdown (paragraphs, headings, lists, code with ` ``` ` fences).
  - **AnswerAr** (string?, optional): Arabic answer. Same Markdown support.
- No separate Answer entity. One question → one English answer + optional Arabic answer. Keeps the model simple and avoids over-engineering.

### What changed

- **Entity:** Added `AnswerAr` (nullable, max 10000). Kept `Answer` as the English field; no rename.
- **DTOs:** All response/create/update DTOs include `answerAr` (optional). API JSON: `answer` (English), `answerAr` (Arabic, optional).
- **Content format:** Both fields support **Markdown** so admins can use:
  - Paragraphs, headings (e.g. `##`), lists
  - Code blocks with triple-backtick fences (e.g. ` ```csharp ` … ` ``` `)
  - Inline code with single backticks
- **Rendering:** Frontend uses `react-markdown` and a shared `AnswerContent` component so the same content is rendered with proper structure and code blocks in admin and public views.

### Why this structure fits the MVP

- Two explicit fields (Answer, AnswerAr) make bilingual support clear and easy to edit.
- Markdown is well-known, keeps storage simple (no HTML/CMS), and gives structure + code without a heavy editor.
- Single shared renderer keeps admin preview and public page consistent and maintainable.

---

## 3. Backend changes

| Area | Change | Why |
|------|--------|-----|
| **Question (entity)** | Added `AnswerAr` (string?, max 10000). | Bilingual answers; Arabic optional. |
| **QuestionConfiguration** | Map `AnswerAr`, `HasMaxLength(10000)`, optional. | EF and DB alignment. |
| **QuestionDto** | `QuestionResponseDto`: added `AnswerAr`. `CreateQuestionDto` / `UpdateQuestionDto`: added `AnswerAr?`. | API exposes and accepts both languages. |
| **CreateQuestionValidator** | `AnswerAr` optional, max 10000 when present. | Validation for new field. |
| **UpdateQuestionValidator** | Same for `AnswerAr`. | Same as create. |
| **QuestionService** | All methods map `AnswerAr` in and out (get list, get by id, create, update). | End-to-end bilingual support. |

No migrations were added; schema change (new column) must be applied manually.

---

## 4. Frontend changes

| Area | Change | What was added/changed |
|------|--------|-------------------------|
| **Types (question.ts)** | `Question`, `CreateQuestionDto`, `UpdateQuestionDto` | Added `answerAr?: string \| null`. |
| **AnswerContent (new)** | Shared component | Renders markdown with paragraphs, headings, lists, code blocks; `lang` for direction (en/ar); `compact` for table; uses `react-markdown`. |
| **pages.css** | New block | `.answer-content` styles: paragraphs, headings, lists, `.answer-content__pre` / `.answer-content__code` for code blocks (monospace, background, border), RTL padding. |
| **Admin form** | Create/Edit question | Two textareas: “Answer (English)” and “Answer (Arabic)”; Arabic textarea has `dir="rtl"`. Hint above: “Markdown supported: **bold**, headings, lists, and code with ``` fences.” |
| **Admin table expanded** | Answer preview | Uses `AnswerContent` for English and Arabic when present; labels “Answer (English)” / “Answer (Arabic)”. |
| **Admin view modal** | Answer display | Same: separate sections per language with `AnswerContent` and labels. |
| **Public question detail** | Answer section | One card per language when content exists (“Answer (English)” / “Answer (العربية)”); body uses `AnswerContent` so markdown and code render correctly. Empty state: single card with “No answer has been added yet.” |
| **package.json** | Dependency | Added `react-markdown`. |

---

## 5. Integration changes

- **Contracts:** API request/response use `answer` (string) and `answerAr` (string | null). Frontend types and form state match.
- **Create/Update:** Admin sends `answer` and `answerAr` (optional); backend maps to `Answer` and `AnswerAr`. Empty string for `answerAr` can be sent as `null` for clarity.
- **Display:** Admin and public both use `AnswerContent` with the same CSS so structure and code blocks look consistent.

---

## 6. Files changed

**Backend**
- `Domain/Entities/Question.cs`
- `Infrastructure/Data/Configurations/QuestionConfiguration.cs`
- `Application/Features/Questions/QuestionDto.cs`
- `Application/Features/Questions/CreateQuestionValidator.cs`
- `Application/Features/Questions/UpdateQuestionValidator.cs`
- `Application/Features/Questions/QuestionService.cs`

**Frontend**
- `Client/package.json` (react-markdown)
- `Client/src/types/question.ts`
- `Client/src/components/shared/AnswerContent.tsx` (new)
- `Client/src/app/styles/pages.css` (answer-content block)
- `Client/src/features/dashboard/pages/QuestionManagementPage.tsx`
- `Client/src/features/questions/pages/QuestionDetailPage.tsx`

**Docs**
- `docs/QUESTIONS-ANSWERS-REFACTOR.md` (this file)

---

## 7. Deferred items

- **Migrations:** No migration files or `dotnet ef database update` were run. You need to add the `AnswerAr` column (e.g. nullable NVARCHAR(10000)) to the Questions table yourself, or generate and run a migration when ready.
- **DbSeeder:** Seed questions still set only `Answer`; `AnswerAr` remains null. Optional: extend seed data later with Arabic answers.
- **Syntax highlighting:** Code blocks are styled (monospace, background, borders) but do not use language-specific highlighting (e.g. Prism). Can be added later if desired.
- **Markdown extensions:** Only standard markdown and code fences are used; no GFM tables or other extensions. Can add (e.g. remark-gfm) if needed.
