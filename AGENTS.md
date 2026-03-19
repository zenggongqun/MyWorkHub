# AGENTS.md

Repository guide for coding agents working in `D:\develop\lab\MyWorkHub`.

## Project Overview

- This is a static browser app with no build system and no package manager.
- Main entry point: `index.html`.
- Legacy entry point: `MyWorkHub.html` redirects to `index.html`.
- Styles live in `assets/css/main.css`.
- JavaScript is split into ordered browser scripts in `assets/js/`.
- Data is stored in `localStorage` under `workhub.db`.
- The app is plain HTML/CSS/JavaScript; there is no framework, bundler, or transpiler.

## Repository Layout

- `index.html`: HTML shell and script/style includes.
- `MyWorkHub.html`: compatibility redirect only.
- `assets/css/main.css`: all current styles.
- `assets/js/constants.js`: constants, preset data, shared `state`, DOM cache, `init()`.
- `assets/js/data.js`: default data and normalization logic.
- `assets/js/events.js`: event binding and event handlers.
- `assets/js/render.js`: modal syncing, render functions, drag/drop persistence helpers.
- `assets/js/utils.js`: helpers for lookup, dates, storage, icons, escaping, toast UI.
- `assets/js/main.js`: startup entry that calls `init()`.
- `docs/plans/`: design notes and implementation plans.

## Rules Files

- No `.cursorrules` file was found.
- No `.cursor/rules/` directory was found.
- No `.github/copilot-instructions.md` file was found.
- If any of those files are added later, treat them as higher-priority repo instructions and update this file.

## Setup and Run Commands

- Open the app directly: open `index.html` in a browser.
- Prefer serving over HTTP when testing browser behavior.
- Simple local server with Python:
  - `python -m http.server 8000`
  - Then visit `http://localhost:8000/index.html`
- Alternative PowerShell static server is not configured.
- No install step is required because there are no external dependencies.

## Build Commands

- There is no build pipeline.
- There is no bundling, transpiling, or asset compilation step.
- Treat "build" as a syntax and smoke-check workflow.

Recommended full validation sequence:

```bash
node --check "assets/js/constants.js" && node --check "assets/js/data.js" && node --check "assets/js/events.js" && node --check "assets/js/render.js" && node --check "assets/js/utils.js" && node --check "assets/js/main.js"
```

## Lint Commands

- No linter is configured.
- No ESLint, Prettier, Stylelint, or HTML linter config exists in the repo.
- Do not invent lint commands in automation.
- If you need a lightweight check, use `node --check` for JavaScript syntax.

## Test Commands

- No automated test framework is configured.
- No unit, integration, or e2e test suites exist yet.
- Current verification is manual browser testing plus JavaScript syntax checks.

Closest equivalents to test commands:

- Full JS syntax check:
  - `node --check "assets/js/constants.js" && node --check "assets/js/data.js" && node --check "assets/js/events.js" && node --check "assets/js/render.js" && node --check "assets/js/utils.js" && node --check "assets/js/main.js"`
- Single-file syntax check:
  - `node --check "assets/js/render.js"`
- Run the app for manual testing:
  - `python -m http.server 8000`

## Single Test Guidance

Because there is no test framework, there is no true "single test" command.
Use one of these instead:

- For a single JavaScript file: `node --check "assets/js/<file>.js"`
- For a single feature: run the local server and manually exercise only that feature in the browser.
- For storage-related work: clear or inspect browser `localStorage` for `workhub.db` before retesting.

## JavaScript Loading Model

- Scripts are loaded by plain `<script src=...>` tags in `index.html`.
- There are no ES module imports or CommonJS imports.
- Load order matters.
- Keep script includes in this order unless you also refactor dependencies:
  1. `assets/js/constants.js`
  2. `assets/js/data.js`
  3. `assets/js/events.js`
  4. `assets/js/render.js`
  5. `assets/js/utils.js`
  6. `assets/js/main.js`
- Shared functions and constants are global within the page scope.
- If you add a new JS file, wire it into `index.html` in dependency order.

## Code Style

### Formatting

- Use 2-space indentation in HTML, CSS, and JavaScript.
- Use semicolons in JavaScript.
- Use double quotes for JavaScript strings unless escaping clearly favors single quotes.
- Keep trailing commas only where they already match surrounding style.
- Prefer one statement per line.
- Keep line length reasonable, but consistency with nearby code matters more than strict wrapping.

### HTML

- Preserve the current semantic structure and accessibility attributes.
- Reuse existing ids/classes instead of inventing near-duplicates.
- Keep `aria-*`, `title`, and `.sr` text in place when modifying interactive controls.
- Prefer editing existing DOM hooks over renaming them, because JS depends on fixed selectors.

### CSS

- Extend existing custom properties in `:root` before adding hard-coded colors everywhere.
- Follow the existing visual language: light glassy panels, teal/blue accents, soft borders, rounded corners.
- Group related selectors together and keep variant selectors adjacent to the base selector.
- Avoid introducing a second competing button system when an existing class can be extended.
- Preserve the current desktop-first styling unless the task explicitly changes layout strategy.

### JavaScript Structure

- Follow the existing separation by responsibility:
  - constants/state/DOM lookup in `constants.js`
  - data shaping in `data.js`
  - event handlers in `events.js`
  - rendering/fill functions in `render.js`
  - reusable helpers in `utils.js`
- Keep startup in `main.js` minimal.
- Prefer small helper functions over duplicating inline logic.
- Avoid introducing classes unless there is a clear architectural reason; current code is function-based.

### Imports and Dependencies

- There are no import statements in the current architecture.
- Do not add `import`/`export` syntax unless you intentionally migrate the whole app to modules.
- Assume globals are shared across files once loaded in order.
- Before moving a function, check which files call it and whether load order still works.

### Types and Data Shape

- This codebase uses plain JavaScript, not TypeScript.
- Represent app entities as normalized plain objects.
- Validate external or persisted data at runtime.
- Follow the existing normalization pattern in `data.js` for any new persisted structure.
- Use defensive checks such as `Array.isArray`, `typeof value === "object"`, and string/date validation.
- Prefer returning `null`, `""`, or a safe fallback over throwing for malformed persisted input.

### Naming Conventions

- Use `camelCase` for variables and functions.
- Use `UPPER_SNAKE_CASE` for app-wide constants.
- Use descriptive handler names such as `onTodoSave`, `onDataExport`, `renderLinks`, `fillCategoryModal`.
- Use boolean-style names for predicates, for example `isManageMode`, `isValidHttpUrl`.
- Use clear noun-based names for entity getters such as `getLinkById`.
- Keep DOM element cache names aligned with their ids or purpose, as in `linkSaveBtn`, `todoQuickForm`, `enginePresetList`.

### Error Handling and Validation

- Prefer validating early and returning with a toast instead of allowing invalid state to propagate.
- Use `toast(title, message, isError)` for user-visible failures and confirmations.
- Wrap browser APIs that may fail in `try/catch`, especially:
  - `JSON.parse`
  - `localStorage`
  - `window.showSaveFilePicker`
  - URL parsing
  - clipboard-like flows
- For invalid persisted data, normalize to a safe fallback instead of crashing.
- Preserve the current read-only fallback behavior when storage writes fail.

### State Management

- Mutate the shared `state` object deliberately and then call `saveDb()` and/or the relevant render function.
- Keep persistent state in `state.db`.
- Keep transient UI state in `state.ui`.
- After changing persisted data, usually call `saveDb()` before `renderAll()` or the narrow render function.
- Avoid hidden side effects outside the established state/store pattern.

### Rendering and DOM Updates

- Prefer rerendering through existing render functions instead of ad hoc DOM patching.
- Use the cached `els` references where possible.
- When generating HTML strings, escape user-controlled content with `escHtml` or `escAttr`.
- Keep modal-prefill logic in `fill*` functions.
- Keep feature-wide redraws in `render*` functions.

### Comments

- Keep comments sparse.
- Add comments only when behavior is non-obvious or cross-file coupling is easy to miss.
- Do not add comments that just restate the code.

## Agent Workflow Recommendations

- Read `index.html` plus the relevant JS/CSS file before editing selectors or DOM ids.
- If changing persisted data shape, update normalization and fallback behavior in `assets/js/data.js`.
- If changing markup hooks, update `els` and any event/render usage together.
- After edits, run the full `node --check` sequence and manually smoke-test the touched feature.
- Mention clearly in your final summary if verification was syntax-only or included browser testing.
