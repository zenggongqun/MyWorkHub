# Header And Right Rail Refresh Design

## Goal

Refresh the top-left brand area so `MyWorkHub` reads like a real page title instead of a pill, keep the daily prompt as a light capsule beside the title, and rebalance the workspace into a clearer left-content and right-todo layout.

## Current State

- The brand block used to read like a compact pill instead of a title.
- The daily prompt used to be visually separated from the title.
- The weekend and holiday countdown currently sit in the search hero, competing with the search area.
- The page uses a three-column shell that makes the right plan area feel more like a side attachment than a clear `我的待办` workspace.

## Proposed Direction

### Layout

- Replace the current brand pill with a title group made of:
  - a clean `MyWorkHub` title
  - a prompt capsule immediately following the title
- Remove the weekend and holiday countdown from the search hero.
- Reframe the page into a left-content and right-rail layout:
  - left side takes roughly two thirds of the width for search, categories, and links
  - right side takes roughly one third of the width for `我的待办`
- Make the left lower area its own two-column grid so categories remain narrow and links remain the main canvas.
- On narrow screens, stack the right rail below the left content.

### Visual Style

- Keep `MyWorkHub` small, refined, and visually calm so it matches the light UI language.
- Keep the prompt in a rounded glass-like capsule, but make it lighter and more companion-like than announcement-like.
- Make the right rail feel intentional by giving it a real module heading: `我的待办`.
- Render the countdown above the calendar as a lightweight status line instead of a pill capsule.
- Preserve the existing page palette and soft glass aesthetic.

### Prompt Behavior

- Replace the single-message-per-weekday model with a weekday prompt pool.
- Each weekday owns multiple prompt options with matching emoji and tone.
- For a given calendar day, pick one prompt deterministically so refreshes do not reshuffle the message.
- When the date changes, the selected prompt changes automatically.

## Content Style

Prompt copy should be:

- short enough to sit cleanly beside the title
- gently funny, not exaggerated
- action nudging rather than motivational poster language
- slightly different by weekday mood

Example tone targets:

- Monday: start small, get moving
- Tuesday: clean up a small pitfall
- Wednesday: push the progress bar again
- Thursday: tighten one more screw this week
- Friday: finish cleanly and avoid handing trouble to next week

## Data and Logic

- Keep using `settings.motto` in local storage so the feature remains backward compatible.
- Update the data source from a flat weekday mapping to weekday entries that contain arrays of prompts.
- Add a stable daily selection function based on the current date and weekday pool.
- Continue rendering the selected emoji and text through the existing header render path.
- Keep the existing weekend and holiday countdown logic and IDs, but remount those nodes into the right rail.

## Implementation Notes

- Update header markup in `MyWorkHub.html` so the title and prompt live in the same visual group.
- Replace `.motto`, `.brand-name`, `.hero-note`, and related typography rules with a new title-group set of styles.
- Update `renderMotto()` so it resolves one prompt from the weekday pool instead of reading one fixed line.
- Remove the hero countdown block from the search panel.
- Add a real header to the right rail using `我的待办`.
- Add a new lightweight countdown row above the calendar and keep the holiday-management entry there.
- Change the shell proportions so the left side owns about two thirds of the page and the right rail owns about one third.

## Responsive Behavior

- Desktop: left content occupies about two thirds of the page, right rail occupies about one third.
- Tablet: left lower grid can stay two-column while the right rail narrows slightly.
- Medium widths: the layout may collapse to a single column if the right rail becomes cramped.
- Mobile: prompt wraps beneath the title, and the right rail stacks below the left content.

## Validation

- Confirm the top-left area reads as a heading, not a tag.
- Confirm the prompt capsule appears directly after the title.
- Confirm the same day keeps the same prompt after refresh.
- Confirm different days produce different prompt choices.
- Confirm the search hero no longer contains countdown UI.
- Confirm the right rail clearly reads as `我的待办`.
- Confirm the countdown sits above the calendar without using a pill capsule style.
- Confirm the page preserves the intended 2/3 and 1/3 desktop rhythm and stacks cleanly when narrow.

## Risks

- A narrow right rail may make the calendar and quick-add form feel cramped if the collapse breakpoint is too late.
- Prompt text that is too long may break the intended one-line feel.
- Countdown text that is too prominent could visually compete with the calendar heading.
- Fully random prompt rotation would feel unstable, so deterministic daily selection is preferred.

## Out of Scope

- Changing the search box layout
- Changing countdown behavior
- Adding user-configurable motto editing UI
