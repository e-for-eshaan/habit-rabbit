# Habit Rabbit

Habit tracker with **sections** (habits), **updates** (log entries), and multiple views: list, frequency chart, and calendar heatmap. Built with Next.js (App Router), Zustand, Ant Design, Tailwind CSS, and Recharts.

**Product overview** (user journeys, fitness vs sections, data flow, key files): [docs/APP_OVERVIEW.md](docs/APP_OVERVIEW.md).

---

## What this app does

- **Sections** – Each section is a habit (e.g. "Exercise", "Reading"). You can add, edit, and reorder them.
- **Updates** – Each section has updates: short log entries with optional timestamps. Add, edit, or soft-delete (undo window) updates.
- **Views** – Switch between:
  - **List** – Sections as cards with grouped updates (by day).
  - **Frequency** – Bar chart of update counts over a chosen range (1m, 3m, 6m, 1y).
  - **Calendar** – Heatmap of activity by day (week, month, last 7, last 30).
- **Search & sort** – Filter sections by search; sort by most updates (all-time or today), recently updated, or name A–Z / Z–A.
- **Layout** – Horizontal cards or grid. Settings (view, layout, calendar range, frequency range, sort) live in the navbar and persist in the store.
- **API** – All data goes through Next.js API routes (`/api/sections`, `/api/sections/[id]/updates`, `/api/fitness`, etc.). With Firebase configured, APIs require authentication and data is stored in Firestore per user. Without Firebase env vars, the app falls back to file-based or in-memory data.

---

## Tech stack

| Area           | Choice                                    |
| -------------- | ----------------------------------------- |
| Framework      | Next.js 16 (App Router), React 19         |
| State          | Zustand (`src/store/useSectionsStore.ts`) |
| UI             | Ant Design 5, Tailwind CSS 4              |
| Charts         | Recharts                                  |
| Date logic     | date-fns                                  |
| Utils / checks | lodash (e.g. `isNil`, `isEmpty`, `get`)   |
| Tests          | Vitest, React Testing Library, jsdom      |
| Lint / format  | ESLint (Next + Prettier), Prettier        |
| Git hooks      | Husky 9, lint-staged                      |

---

## Project structure

```
habit-rabbit/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # Root layout (fonts, AntdRegistry, globals)
│   │   ├── page.tsx            # Main home page (sections, views, FAB)
│   │   ├── globals.css         # Tailwind + fluid typography
│   │   └── api/                # API routes
│   │       └── sections/        # CRUD for sections and updates
│   ├── components/             # React components
│   │   ├── Navbar.tsx          # Search, settings menu, view/layout/calendar/freq toggles
│   │   ├── SectionCard.tsx     # One section (title, updates, add/edit/delete)
│   │   ├── FreqChart.tsx       # Recharts frequency bar chart
│   │   ├── CalendarGrid.tsx    # Calendar heatmap
│   │   ├── SettingsMenu.tsx    # View, layout, calendar range, freq range, sort
│   │   ├── AddHabitFab.tsx     # FAB to add new section
│   │   ├── DeleteToast.tsx     # Undo for soft-delete
│   │   └── ...                 # UpdateItem, AddUpdateForm, toggles, etc.
│   ├── store/
│   │   └── useSectionsStore.ts # Global state (sections, UI prefs, API calls)
│   ├── lib/                    # Pure utils + API client
│   │   ├── api.ts              # fetch wrappers for /api/sections
│   │   ├── sectionsFilterSort.ts
│   │   ├── groupUpdatesByDay.ts
│   │   ├── dateRange.ts, calendarHeatmap.ts, formatIndianDate.ts, utils.ts
│   │   └── store.ts            # Optional persisted store helpers
│   ├── constants/              # Shared constants
│   │   ├── colors.ts           # Pastel palette, getPastelStyle
│   │   ├── sortOptions.ts, viewOptions.ts
│   │   ├── antdTheme.ts
│   │   └── ...
│   ├── types/
│   │   └── index.ts            # Section, Update, LayoutChildren
│   └── test/
│       ├── setup.ts            # RTL + jest-dom
│       └── vitest-setup.d.ts   # Vitest + jest-dom types
├── .husky/                     # Git hooks (Husky 9)
│   ├── pre-commit              # lint-staged + format:check + lint
│   └── _/                      # Husky internals (hooksPath)
├── .cursor/
│   ├── practices.md            # Code conventions (no default export, lodash, etc.)
│   └── rules/                  # Cursor AI rules
│       ├── pre-commit-agentic.mdc   # "Fix lint/format" → run fix then check
│       └── github-issue-agent.mdc  # "Implement issue #N" → implement + PR
├── .github/
│   ├── workflows/
│   │   ├── ci.yml              # Check + build on push/PR
│   │   └── agentic-issue.yml   # On label "agent": create branch + draft PR
│   └── AGENTIC_ISSUES.md       # How to have an agent pick up issues and deploy
├── check.sh                    # Pre-commit check script (format, lint, lint-staged)
├── fix.sh                      # Format + lint:fix
├── vitest.config.ts
├── eslint.config.mjs
├── .prettierrc / .prettierignore
└── package.json
```

---

## Scripts

| Command                    | What it does                                                     |
| -------------------------- | ---------------------------------------------------------------- |
| `pnpm dev`                 | Next dev (webpack).                                              |
| `pnpm build`               | Production build.                                                |
| `pnpm start`               | Run production server.                                           |
| `pnpm run check`           | Format check + lint (no fix).                                    |
| `pnpm run lint`            | ESLint (includes `no-console`).                                  |
| `pnpm run lint:fix`        | ESLint with auto-fix.                                            |
| `pnpm run format`          | Prettier write.                                                  |
| `pnpm run format:check`    | Prettier check only.                                             |
| `pnpm run fix:all`         | Runs `fix.sh`: format + lint:fix.                                |
| `pnpm run check:precommit` | Runs full pre-commit check (same as Husky).                      |
| `./check.sh`               | Human-friendly check (format, lint, lint-staged) with fix hints. |
| `./fix.sh`                 | Format + lint:fix.                                               |
| `pnpm run test`            | Vitest watch.                                                    |
| `pnpm run test:run`        | Vitest single run.                                               |
| `pnpm run prepare`         | Husky install (run after clone; sets `core.hooksPath`).          |

---

## Code conventions (and how I work)

These are the rules and behaviors I use in this repo. Anyone (or any agent) editing the codebase should follow them.

### General

- **No comments unless necessary.** Prefer clear names over comments.
- **Lint before commit.** Use `pnpm run check` or the pre-commit flow (see below). I use `npx eslint . --quiet` to verify.

### Exports and imports

- **No default exports** (except where the framework requires it, e.g. Next.js `layout.tsx` / `page.tsx`). Use named exports and import like `import { X } from "@/..."`.
- **Path alias:** `@/` points to `src/`. Use `import { x } from "@/components/..."`, `@/lib/...`, `@/constants/...`, `@/store/...`, `@/types`.

### Types and checks

- **Null/undefined:** Don’t use `value !== null && value !== undefined`. Use `isNil` from lodash: `if (!isNil(data))`.
- **Loose equality:** Don’t use `!=`. Use explicit checks (`if (data)`) or lodash (`if (!isNil(data))`).
- **Type checks:** Don’t use `typeof x !== 'object'` or similar. Use lodash: `isObject`, `isString`, etc.

### React and UI

- **No `<style>` tags.** Use CSS modules or inline styles `style={{ ... }}`.
- **Component file order:**
  1. Imports
  2. Small constants (or put in `src/constants/`)
  3. Main component (named after the file; named export)
  4. Supporting components
  5. Utils (small ones here; bigger ones in `lib/` or `utils/`)

### Dates

- **Use date-fns** for date math. No raw millisecond math. Use helpers like `differenceInCalendarDays`, `subDays`, `eachDayOfInterval`, `startOfWeek`, `endOfMonth`.

### Organization

- **Constants** in `src/constants/` (e.g. `sortOptions.ts`, `colors.ts`, `viewOptions.ts`, `antdTheme.ts`). Avoid big inline objects in components.
- **Utils** in `src/lib/` (or `src/utils/`). Pure helpers; components import from `@/lib/...` or `@/constants/...`.

### Performance

- **useMemo** for derived data (filtered/sorted lists, computed arrays) that depend on props/state.
- **useCallback** for stable callbacks passed to children or used in effect deps.

### Testing

- **Vitest + React Testing Library.** Tests live next to source (`*.test.ts`, `*.test.tsx`). Run: `pnpm run test` or `pnpm run test:run`.
- **Setup:** `src/test/setup.ts` wires `@testing-library/jest-dom`. Use `getByTestId` when multiple elements match (e.g. StrictMode); otherwise `getAllBy*` + index or `fireEvent` as needed.

### Responsive typography

- Root font size is fluid in `globals.css` (clamp on `html`). Use rem-based Tailwind so type scales. For very small labels, use `.text-fluid-xs`.

### Lint rules I care about

- **no-console:** ESLint errors on `console.log` / `console.*`. No debug logs in prod; remove them or use a proper logger.

---

## Pre-commit and “agentic” check flow

I want every commit to pass format and lint (including no-console). I also want an AI agent to be able to fix and re-check in one go.

### What runs on commit (Husky)

- **Pre-commit hook** (`.husky/pre-commit`): runs **lint-staged** (Prettier + ESLint --fix on staged files), then **format:check**, then **lint**. If any step fails, the commit is blocked.
- **Lint-staged** (in `package.json`): on `*.{js,jsx,ts,tsx,json,css,md}`, runs `prettier --write` and `eslint --fix`.  
  Note: `.github/workflows/*.yml` are in `.prettierignore` so Prettier doesn’t parse them (avoids YAML parse issues).

### Scripts for checking and fixing

- **`./check.sh`** – Runs format:check, lint, and lint-staged with readable output and fix hints (e.g. “Prettier wants a word” → `pnpm run format`).
- **`./fix.sh`** – Runs `pnpm run format` and `pnpm run lint:fix`. Use this when the agent (or you) needs to auto-fix before re-checking.
- **Agentic flow:** When I say “pre-commit failed”, “fix lint”, or “make checks pass”, I want the agent to run the fix script, then the check script, and if something still fails (e.g. `console.log`), fix the code and re-run until the check passes. The Cursor rule **pre-commit-agentic** describes this; the agent should run `pnpm run fix:all` then `./check.sh` and address any remaining issues.

---

## How I want agents to handle GitHub issues (“agentic” issues)

I want to create an issue and have an agent implement it and open a PR so I can merge and deploy (e.g. Vercel on `main`).

### Cursor agent (me asking in chat)

- When I say **“Implement issue #N”**, **“Pick up my latest issue”**, or **“I just created a new issue”**, the agent should:
  1. Resolve the issue (by number or “latest” via `gh issue view` / `gh issue list`). I have **GitHub CLI** installed and logged in.
  2. Implement the work in the repo.
  3. Run the check flow (`pnpm run fix:all` then `./check.sh`) and fix any failures (including removing `console.*`).
  4. Create a branch (e.g. `issue-5-short-slug`), commit, push, and open a PR that **closes the issue** (body: “Closes #5”). The agent should not merge; I merge the PR so that deploy (e.g. Vercel) runs.

The Cursor rule **github-issue-agent** encodes this. I don’t want the agent to suggest I run commands manually when I’ve asked it to implement an issue; it should run the flow and fix code as needed.

### Optional: GitHub Action for label “agent”

- If I add the label **`agent`** to an issue, the workflow **agentic-issue.yml** creates a branch and a **draft PR** and comments on the issue. Then I (or the agent in Cursor) can implement on that branch; merging the PR is the deploy step.
- Details: [.github/AGENTIC_ISSUES.md](.github/AGENTIC_ISSUES.md).

---

## Setup (for me or a new clone)

1. **Node:** >= 20. **pnpm:** >= 9 (see `packageManager` in `package.json`).
2. **Install:** `pnpm install`.  
   This runs `prepare`, which runs **Husky** and sets `git config core.hooksPath` to `.husky/_` so the pre-commit hook runs.
3. **Env (production):** Copy `.env.example` to `.env.local` and fill in:
   - **Firebase (client):** `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, and optionally `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`, `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`, `NEXT_PUBLIC_FIREBASE_APP_ID` (from Firebase Console → Project settings → Your apps).
   - **Firebase Admin (server):** `FIREBASE_SERVICE_ACCOUNT_KEY` (JSON string) or `GOOGLE_APPLICATION_CREDENTIALS` (path to service account JSON). From Firebase Console → Project settings → Service accounts → Generate key.
     Without these, login and API auth are disabled and the app uses file-based or in-memory data only.
     **Firestore rules:** In Firebase Console → Firestore → Rules, restrict `users/{userId}/data/*` to the signed-in user: `request.auth != null && request.auth.uid == userId`.  
     **Service account IAM:** The Firebase Admin SDK service account (e.g. `firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com`) must have the **Cloud Datastore User** role so the server can read/write Firestore. In Google Cloud Console → IAM & Admin → IAM, find the service account and add the role if you see "Missing or insufficient permissions" from the API.
4. **Dev:** `pnpm dev`.  
   **Build:** `pnpm build`. **Run prod:** `pnpm start`.
5. **GitHub CLI (for agentic issues):** `gh auth login` so the agent can read issues and create PRs.

---

## CI/CD

- **GitHub Actions (ci.yml):** On push/PR to `main` (or `master`): **check** (format + lint) and **build**. No deploy in the workflow; I connect the repo to **Vercel** (or similar) so that push to `main` triggers deployment.
- **Vitest:** Used only locally / in tests; `next build` type-checks the app (including `tsconfig`). `vitest.config.ts` is excluded from anything that would break the Next build (e.g. `resolve` is only at top level so TypeScript is happy).

---

## Summary of my behaviors and needs (for agents and humans)

- **Conventions:** Named exports, `@/` imports, lodash for null/type checks, no `!=`, no `<style>`, no `console.*`, date-fns for dates, useMemo/useCallback where it matters, tests next to source with Vitest + RTL.
- **Pre-commit:** Must pass format + lint (including no-console). Use `check.sh` for a friendly report and `fix.sh` (or `pnpm run fix:all`) to fix; agent should re-run until the check passes.
- **Issues:** When I ask to “implement issue #N” or “pick up my latest issue”, implement it, run the check flow, open a PR that closes the issue, and don’t merge (I merge to deploy).
- **Docs:** Create docs for files when making changes and update them with new changes. this allows infinite context gathering. allows agents to work with changes and learn
