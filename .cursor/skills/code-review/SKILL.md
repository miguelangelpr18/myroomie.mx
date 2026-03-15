---
name: code-review
description: Perform a senior-level code review focused on architecture, duplication, component size, naming, performance, and scalability. Use when the user asks for a code review, senior review, or to identify improvements in the current codebase or selected files.
---

# Senior Code Review

## Instructions

Review the code in scope and identify issues across these dimensions:

1. **Architecture** — Misaligned layers, tight coupling, missing abstractions, unclear boundaries (e.g. UI calling DB directly), circular dependencies.
2. **Duplicated logic** — Repeated patterns, copy-paste, logic that should be shared (utils, hooks, services).
3. **Large components** — Files or components that do too much (e.g. >200–300 lines), mixed concerns, missing extraction of subcomponents or hooks.
4. **Naming** — Unclear or inconsistent names (vars, functions, components, files), misleading names, wrong abstraction level in names.
5. **Performance** — Unnecessary re-renders, missing memoization where it matters, heavy work on the main thread, N+1 or inefficient data fetching, large bundles or missing code-splitting.
6. **Scalability** — Assumptions that break at scale (in-memory state, no pagination, hard limits), missing indexes or inefficient queries, no caching strategy where it would help.

## Output format

Provide a **prioritized list of improvements**:

- **Critical** — Architecture or correctness issues, clear bugs, major performance or scalability risks. Fix first.
- **High** — Significant duplication, oversized components, or naming that hurts maintainability. Fix soon.
- **Medium** — Clear wins: smaller refactors, naming cleanup, obvious performance improvements.
- **Low** — Nice-to-haves: style, minor consistency, optional optimizations.

For each item: brief title, 1–2 sentence explanation, and (when useful) file/area and a concrete suggestion.

## Example

```markdown
## Prioritized improvements

### Critical
- **Auth state in component state** — Session is kept in React state only; refresh loses auth. Move to a persistent store or server session and restore on load. (`app/layout.tsx`)

### High
- **Listing card logic duplicated** — Same card layout and logic in `ListingsGrid` and `SearchResults`. Extract a single `ListingCard` component and reuse. (`components/`)

### Medium
- **`useEffect` without deps** — Fetch in `RoomDetail` runs on every render. Add dependency array or move to a data layer (e.g. server component or fetch in parent). (`app/room/[id]/page.tsx`)

### Low
- **Inconsistent button variants** — Mix of `primary` / `btn-primary`. Standardize on one naming scheme. (Design system)
```
