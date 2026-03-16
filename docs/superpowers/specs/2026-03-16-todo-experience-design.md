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

1. Priority
2. Date
3. Manual drag order

Completed items are visually separated from active items, either collapsed at the bottom of each group or collected in a folded completed area.

### Calendar Time Navigation

- The calendar remains visible in the right column.
- Its role changes from standalone module to time navigator for tasks.
- It helps users jump to a date or week context without replacing the action-focused todo view.

## Task Model

Each task should support these default fields:

- `title`: required primary label
- `date`: optional explicit date
- `priority`: lightweight priority signal
- `scene`: lightweight grouping tag such as work/life/study/other
- `done`: completion state
- `order`: group-local manual ordering signal

Behavioral rules:

- Tasks without a date belong in `Later`.
- Tasks with a current-day date belong in `Today`.
- Tasks within the current week but not today belong in `This Week`.
- Changing date or scene can move the task into a new visible group.

This model stays intentionally small to preserve speed and readability.

## Interaction Design

### Add Task

Task creation uses two paths:

- Fast path: type title and press Enter.
- Expanded path: add date, priority, and scene through a lightweight expanded editor.

Default assumptions should reduce effort:

- Default priority: medium
- Default scene: reuse last selection when practical
- Default time placement: today or this week based on the active context

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
- Cross-group movement should map to changing time placement or scene, not ambiguous freeform drag semantics.
- When a task changes date or group, it re-enters the target group according to that group's sorting rules.

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

- Changing calendar month should not wipe out the user context in a confusing way.
- The UI should preserve browsing orientation and show a clear lightweight context indicator when viewing another month.

### Week / Month Toggle

- Keep the existing week/month control, but redefine it as a view filter over task scope rather than two disconnected todo systems.

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

### Task Volume

- If Today or This Week becomes long, groups should be collapsible.
- High-priority items should remain easier to find than low-priority backlog items.

### Data Predictability

- Undated tasks must always have an obvious home (`Later`).
- Sorting behavior must remain predictable after edits, drags, and date changes.

## Component Boundaries

The design should remain modular enough for planning and implementation:

- `QuickCapture`: capture-first input with progressive disclosure
- `TodoGroupList`: renders Today / This Week / Later groups
- `TodoCard`: displays the lightweight task card and in-place edits
- `TodoFiltersContext`: tracks active time scope such as selected date/week/month view
- `TodoCalendarNavigator`: calendar with task state indicators and navigation behavior
- `TodoFeedbackLayer`: handles undo feedback and transient action messaging

Each unit has a clear responsibility and can be reasoned about independently.

## Acceptance Criteria

The redesign succeeds if it clearly improves these outcomes:

1. Adding a task feels faster than the current flow.
2. Users can quickly identify what should be done today.
3. Users can maintain task details with fewer interruptions.
4. The calendar genuinely helps users navigate task time context.
5. The todo area feels like a meaningful part of the workspace rather than an afterthought.

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
