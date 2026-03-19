# Static File Split Design

## Goal

Refactor the single-file `MyWorkHub.html` app into a maintainable static multi-file structure without introducing a build tool.

## Scope

- Create a new `index.html` entry file.
- Extract inline CSS into `assets/css/main.css`.
- Extract inline JavaScript into multiple responsibility-based files under `assets/js/`.
- Keep the current UI structure, DOM ids, storage keys, and runtime behavior stable.
- Preserve backward access through `MyWorkHub.html` by redirecting it to `index.html`.

## Target Structure

```text
index.html
assets/
  css/
    main.css
  js/
    constants.js
    data.js
    events.js
    render.js
    utils.js
    main.js
MyWorkHub.html
```

## Module Responsibilities

- `assets/js/constants.js`
  - app constants
  - preset engine data
  - motto data
  - shared `state`
  - DOM element cache
  - `init()`
- `assets/js/data.js`
  - default data
  - storage payload normalization
  - entity normalization helpers
- `assets/js/events.js`
  - event binding
  - search, link, category, todo, import/export handlers
- `assets/js/render.js`
  - modal sync
  - render and fill functions
  - drag-and-drop persistence helpers
- `assets/js/utils.js`
  - shared queries and lookups
  - date helpers
  - icon helpers
  - storage write helpers
  - toast helpers
- `assets/js/main.js`
  - startup entry calling `init()`

## Notes

- The refactor intentionally keeps plain browser script loading in a stable order instead of introducing ES module imports or a bundler.
- This keeps the app usable as a static file while still removing the single-file maintenance bottleneck.
- A later phase can further split CSS and JavaScript by feature domain if needed.
