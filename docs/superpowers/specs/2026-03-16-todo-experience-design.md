# Todo Experience Design

- Date: 2026-03-16
- Project: `MyWorkHub`
- Scope: Improve the existing right-side todo experience inside `MyWorkHub.html`
- Status: Approved design, ready for spec review

## Context

`MyWorkHub` already includes a right-side planning area with holiday countdown, calendar, and a lightweight todo module. Recent commits show ongoing investment in month todos, holiday fetching, drag sorting, and data actions. The current todo area works as a supporting widget, but it does not yet feel like a strong action surface.

The current pain points are:

- Adding tasks is still more effortful than it should feel.
- Users cannot quickly tell what deserves attention first.
- Tasks are not convenient enough to maintain after capture.
- The todo area feels secondary instead of like a core part of the workspace.

## Goals

- Make task capture feel fast and natural.
- Make the next action obvious when opening the page.
- Make routine task maintenance low-friction.
- Increase the visual and product weight of the todo area without turning it into a heavy project manager.
- Preserve the existing value of the calendar through tighter todo linkage.

## Non-Goals

- No multi-user collaboration.
- No full project-management features such as deep hierarchies, milestones, or complex workflows.
- No large-scale redesign of the rest of the WorkHub layout beyond what supports the todo area.
- No requirement for subtasks in the default experience.

## Chosen Product Direction

The chosen direction is a lightweight balanced todo experience:

- It should remain as easy to use as an inbox for quick capture.
- It should also act as an action panel that helps users decide what to do now.
- The smallest useful unit is a task with grouping support.
- The primary organization model is time-first, with lightweight secondary management signals.
- Calendar and todo remain dual entry points.
- Task cards keep light management metadata only: title, date, priority, and scene/group.

## Alternatives Considered

### 1. Lightweight action panel (chosen)

Keep the right column as a single action-oriented sidebar, but upgrade it from a basic input-plus-list widget into a stronger task surface with capture, grouped execution, and calendar linkage.

Why chosen:

- Fits the existing three-column layout best.
- Solves input, prioritization, maintenance, and presence together.
- Keeps implementation scope focused.

Trade-off:

- The sidebar width remains constrained, so density must stay disciplined.

### 2. Calendar-driven todo

Make the calendar the main driver and show tasks primarily by selected date.

Why not chosen:

- Strong for date-bound work, weak for quick capture and undated tasks.
- Risks making todos feel subordinate to the calendar.

### 3. Mini board / kanban sidebar

Split the sidebar into multiple columns or stronger status lanes.

Why not chosen:

- Execution visibility is good, but it is too heavy for the available width.
- Would push the product toward project-management complexity.

## Information Architecture

The right column becomes an action sidebar with three layers:

1. Quick capture area
2. Focused todo groups
3. Calendar time navigation

### Quick Capture Area

- Always visible at the top of the todo section.
- Supports one-line capture first.
- Allows progressive disclosure for extra fields instead of forcing a full form up front.

### Focused Todo Groups

Default grouping is:

- Today
- This Week
- Later

This replaces the current feeling of a flat list with a more action-oriented structure. Users should open the page and immediately understand what belongs now versus later.

Within each group, ordering follows:

1. Manual drag order
2. Priority
3. Date

Completed items are visually separated from active items in a folded completed subsection at the bottom of each visible group.

Ordering rules are deterministic:

- New tasks created from quick capture insert at the top of the active destination group, then receive a stable `order` value.
- Dragging inside a group rewrites `order` and becomes the primary display order for that group.
- Priority and date act as default placement hints only when a task first enters a group or re-enters a different group.
- Editing a task without changing its group preserves its manual order.
- Changing a task's date can move it into another group; once moved, it is inserted using the destination group's default placement rule and can then be manually reordered there.

### Calendar Time Navigation

- The calendar remains visible in the right column.
- Its role changes from standalone module to time navigator for tasks.
- It helps users jump to a date or week context without replacing the action-focused todo view.

## Task Model

Each task should support these default fields:

- `title`: required primary label
- `date`: optional explicit date
- `priority`: lightweight priority signal with enum `high | medium | low`
- `scene`: lightweight grouping tag with enum `work | life | study | other`
- `done`: completion state
- `order`: group-local manual ordering signal
- `createdAt`: creation timestamp used for stable fallback ordering

Behavioral rules:

- Tasks without a date belong in `Later`.
- Tasks with a current-day date belong in `Today`.
- Tasks within the current week but not today belong in `This Week`.
- Changing date can move the task into a new visible group.

Field semantics:

- `priority` controls chip color, compact label, and default insertion weight when a task first enters a group.
- `high` marks urgent or important work, `medium` is the default, and `low` is for non-urgent backlog.
- `scene` is visible as a compact chip on the task card and available as a lightweight filter in the todo header or expanded editor.
- `scene` does not create separate top-level groups in this iteration; it exists to help scanning, filtering, and light organization.

Week definition:

- A week starts on Monday and ends on Sunday, matching the current calendar presentation.
- `Today` always overrides week placement.
- `This Week` means dates from tomorrow through the end of the current Monday-Sunday week.
- Any later dated task belongs in `Later` unless the user is explicitly browsing another date context.

This model stays intentionally small to preserve speed and readability.

## Interaction Design

### Add Task

Task creation uses two paths:

- Fast path: type title and press Enter.
- Expanded path: add date, priority, and scene through a lightweight expanded editor.

Default assumptions should reduce effort:

- Default priority: medium
- Default scene: reuse last selection when practical
- Default time placement follows explicit context rules:
  - no selected date and no special browsing context: create the task with today's date so it lands in `Today`
  - selected future date in the current week: add to that date and show in `This Week`
  - selected date outside the current week: add to that explicit date and surface it under `Later`
  - browsing another month without a selected date: keep default capture in `Today` to avoid accidental future scheduling

If the user explicitly clears the date in expanded editing, the task becomes undated and moves to `Later`.

### Edit Task

- Prefer inline or in-card expansion over interruptive modal editing.
- Keep delete confirmation as a dedicated confirmation flow.
- Reserve full modal editing only for advanced cases, if still needed at all.

### Complete Task

- Checking complete should give obvious visual feedback.
- The item should transition into the completed area rather than staying mixed with active items.
- Provide a short undo affordance after completion.

### Reorder and Move

- Drag sorting applies inside a group for manual prioritization.
- Cross-group movement should map to changing time placement, not ambiguous freeform drag semantics.
- When a task changes date or group, it re-enters the target group according to that group's sorting rules.

## View State Model

The todo experience should have a small explicit state model so planning stays testable:

- `selectedDate`: optional calendar day actively selected by the user
- `viewedMonth`: month currently shown in the calendar
- `scopeMode`: `week | month`
- `sceneFilter`: optional filter across all visible time groups

Behavior rules:

- On initial load, `selectedDate` is empty and `viewedMonth` is the current month.
- In `week` mode, the todo panel emphasizes `Today`, `This Week`, and `Later` using the current Monday-Sunday week.
- In `month` mode, the same three groups remain, but `This Week` is replaced by `This Month` for the currently viewed month while preserving `Today` and `Later`.
- When a specific date is selected in `week` mode, the header shows that date, the selected date's tasks are pinned at the top of the relevant group, and the remaining groups stay visible for surrounding context.
- When a specific date is selected in `month` mode, the header shows that date, the selected date's tasks are pinned at the top of `This Month`, and other `This Month` tasks remain visible below them.
- Clearing date focus returns the panel to the default scope-driven grouping.

Month-mode placement rules:

- `Today` still contains only tasks dated today.
- `This Month` contains dated tasks in `viewedMonth` except those already in `Today`.
- `Later` contains undated tasks plus tasks dated after the end of `viewedMonth`.
- Tasks dated before the start of `viewedMonth` are shown only when explicitly browsing their date or month; they are not mixed into the active forward-looking groups.

## Calendar and Todo Linkage

The relationship is dual-entry, with todos as the primary action surface and the calendar as the primary time-navigation surface.

### From Calendar to Todos

- Clicking a calendar day temporarily focuses the todo panel on that date and its surrounding week context.
- The todo header should clearly show the active browsing context, such as a selected date or current week.

### From Todos to Calendar

- Clicking a task date should highlight or jump to the corresponding calendar date.

### Calendar Visual Signals

The calendar should communicate task relevance instead of acting as decoration. At minimum it should distinguish:

- Dates with tasks
- Dates with high-priority tasks
- Dates whose tasks are all completed

### Month Navigation Behavior

- Changing the visible calendar month updates `viewedMonth` only.
- If the user has not selected a specific date, the todo list keeps the current scope grouping and the header adds a lightweight note such as "Viewing April calendar".
- If the user selects a date in another month, that date becomes `selectedDate` and the todo list updates around that date's scope.
- Returning to the current month does not clear active tasks or manual ordering.

### Week / Month Toggle

- Keep the existing week/month control, but redefine it as a view filter over task scope rather than two disconnected todo systems.
- In `week` mode, visible groups are `Today`, `This Week`, and `Later`.
- In `month` mode, visible groups are `Today`, `This Month`, and `Later`.
- Quick capture defaults follow the currently selected date if there is one; otherwise they still default to `Today`.
- Switching scope mode never creates a second storage model; it only changes how the same tasks are grouped and filtered.
- Group ordering rules stay the same in both modes: manual order first inside a group, then priority/date only for default insertion.

## Visual and UX Principles

- The todo area should feel like a core workspace panel, not a leftover utility card.
- The hierarchy should emphasize what to do now before how the data is stored.
- Empty states should invite action, not simply report absence.
- Metadata should support decisions without overwhelming the narrow sidebar.
- The right panel should feel denser in usefulness, not denser in raw content.

## Empty States and Error Handling

### Empty States

- If there are no active tasks, show an action-oriented prompt such as encouraging the user to record the next small task to push forward.
- If a specific group is empty, keep the group visible but lightweight so the time structure remains understandable.

### Mistakes and Recovery

- Completing a task should allow quick undo.
- Deleting a task should continue to require confirmation.
- If a save fails, the task card keeps its pre-edit state and the UI shows a concise retry message.
- If ordering data is invalid or missing, the list falls back to stable created-time order inside each group.
- If calendar decorations cannot be computed, the calendar still renders dates and selection behavior without task-density markers.

### Task Volume

- If Today or This Week becomes long, groups should be collapsible.
- High-priority items should remain easier to find than low-priority backlog items.

### Data Predictability

- Undated tasks must always have an obvious home (`Later`).
- Sorting behavior must remain predictable after edits, drags, and date changes.

## Component Boundaries

The design should remain modular enough for planning and implementation:

- `QuickCapture`: capture-first input with progressive disclosure
- `TodoGroupList`: renders the active scope groups (`Today`, `This Week` or `This Month`, and `Later`), including each group's folded completed subsection
- `TodoCard`: displays the lightweight task card and in-place edits
- `TodoFiltersContext`: owns `selectedDate`, `viewedMonth`, `scopeMode`, and `sceneFilter`, and exposes read/update methods to the rest of the todo area
- `TodoCalendarNavigator`: renders the calendar using `TodoFiltersContext`, updates date/month state, and consumes derived per-day task markers
- `TodoFeedbackLayer`: handles undo feedback and transient action messaging

Interface expectations:

- `QuickCapture` creates tasks through a single create-task action and does not own list ordering logic.
- `TodoGroupList` receives already grouped task data plus callbacks for reorder, edit, complete, and delete.
- The grouped-data contract is: an ordered array of visible groups, where each group has `id`, `label`, `activeItems`, and `completedItems`.
- `TodoCard` does not compute placement rules; it edits task fields and delegates moves to higher-level state.
- `TodoFiltersContext` is the single source of truth for time/filter state shared by list and calendar.
- `TodoCalendarNavigator` never mutates tasks directly; it only changes browsing context.
- `TodoFeedbackLayer` is presentation-only and never owns task data.

Each unit has a clear responsibility and can be reasoned about independently.

## Acceptance Criteria

The redesign succeeds if it clearly improves these outcomes:

1. A user can create a basic task from the default input with one text entry and one submit action.
2. A user opening the page can see active `Today` tasks without first selecting a calendar date.
3. A user can edit date, priority, or scene in place without opening a full modal in the common case.
4. Selecting a calendar date changes the visible todo context and that selected context is reflected in the header.
5. Completed tasks are visually separated from active tasks and support undo after completion.
6. Undated tasks consistently appear in `Later`.
7. The right sidebar presents a visible task structure even when one or more groups are empty.

## Integration Notes

- The redesign should build on the existing todo and calendar data already present in `MyWorkHub.html`, rather than introducing a parallel storage system.
- Existing persisted tasks should migrate into the new grouping logic without requiring user cleanup.
- Legacy tasks that do not have `priority` or `scene` should be normalized to `medium` and `other`.
- Legacy tasks that do not have `order` should derive a stable initial order from existing list position.
- Legacy tasks that do not have `createdAt` should receive a deterministic migration timestamp or fallback sequence value during normalization.
- Existing date-based todo data should continue to render correctly under the new grouping and filtering rules.

## Testing Guidance for Planning

Planning and implementation should include validation for:

- Fast capture with and without extra fields
- Correct placement into Today / This Week / Later
- Correct behavior for undated tasks
- Completion, undo, and delete-confirmation flows
- Drag reorder within groups
- Date change behavior and cross-group movement
- Calendar day selection and reverse linking from task dates
- Empty states and overloaded-group states
- Persistence of task metadata and ordering

## Open Questions

None. The design is intentionally kept within lightweight single-user todo scope.
