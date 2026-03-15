# Habit Rabbit – Cursor practices

Practices to follow when editing this codebase.

## General

- **No comments unless necessary.** Prefer descriptive variable and function names.
- **Lint.** Run `pnpm run check` (or `npx eslint . --quiet`) to verify format and lint before committing.

## Exports and imports

- **No default exports.** Use named exports only.
- **Imports.** Use path alias: `import { x } from "@/..."`.

## Types and checks

- **Null/undefined.** Do not use `value !== null && value !== undefined`. Use `isNil` from lodash (e.g. `if (!isNil(data))`).
- **Loose equality.** Do not use `!=`. Use explicit checks (e.g. `if (data)`) or lodash (e.g. `if (!isNil(data))`).
- **Type checks.** Do not use `typeof x !== 'object'` or similar. Use lodash: `isObject`, `isString`, etc.

## React and UI

- **No `<style>` tags.** Use CSS modules or inline styles (`style={{ ... }}`).
- **Component file layout (in order):**
  1. Imports
  2. Small constants (otherwise in `constants/`)
  3. Main component (the one named after the file; named export only)
  4. Supporting components
  5. Utils (small ones here; larger ones in `utils/` or `lib/`)

## Dates and time

- **Use date-fns for date math.** Do not use raw millisecond math (e.g. `(end - start) / (24 * 60 * 60 * 1000)`). Use date-fns helpers (e.g. `differenceInCalendarDays`, `subDays`, `eachDayOfInterval`, `startOfWeek`, `endOfMonth`) and constants.

## Code organization

- **Constants.** Put shared constants in `src/constants/` (e.g. `sortOptions.ts`, `colors.ts`, `viewOptions.ts`, `antdTheme.ts`). Avoid large inline constant objects in components.
- **Utils.** Put pure helpers in `src/lib/` or `src/utils/`. Have components import from `@/lib/...` or `@/constants/...`.

## Performance

- **useMemo.** Use for derived data (e.g. filtered/sorted lists, computed arrays) that depends on props/state.
- **useCallback.** Use for stable callbacks passed to children or used in effect deps (e.g. event handlers from props, store actions passed down).

## Testing

- **Unit tests.** Use Vitest and React Testing Library. Tests live next to source (e.g. `utils.test.ts`, `SectionCard.test.tsx`). Run with `pnpm run test` or `pnpm run test:run`.
- **Test setup.** `src/test/setup.ts` wires `@testing-library/jest-dom`. Use `getByTestId` when multiple elements match (e.g. under StrictMode); prefer `getAllBy*` and index or `fireEvent` when needed.

## Responsive typography

- **Fluid font sizes.** Root font size is fluid in `globals.css` (`clamp` on `html`). Use rem-based Tailwind classes so type scales with viewport. For extra-small labels, use the `.text-fluid-xs` class.
