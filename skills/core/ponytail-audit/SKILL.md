---
name: ponytail-audit
description: >
  Whole-repo audit for over-engineering. Like ponytail-review, but scans the
  entire codebase instead of a diff: a ranked list of what to delete, simplify,
  or replace with stdlib/native equivalents. Use when the user says "audit this
  codebase", "audit for over-engineering", "what can I delete from this repo",
  "find bloat", "ponytail-audit", or "/ponytail-audit". One-shot report, does
  not apply fixes. Scoped to business logic only (UI/CSS excluded).
origin: https://github.com/DietrichGebert/ponytail
---

# Ponytail Audit

ponytail-review, repo-wide. Scan the whole tree instead of a diff. Rank
findings biggest cut first.

**Scope exclusion**: UI components, CSS, design tokens, and animation code
are governed by the Color Master Palette — do not flag those as over-engineered.

## Tags

Same as ponytail-review:

- `delete:` dead code, unused flexibility, speculative feature. Replacement: nothing.
- `stdlib:` hand-rolled thing the standard library ships. Name the function.
- `native:` dependency or code doing what the platform already does. Name the feature.
- `yagni:` abstraction with one implementation, config nobody sets, layer with one caller.
- `shrink:` same logic, fewer lines. Show the shorter form.

## Output

Ranked list, biggest cut first. End with: `N findings, ~M lines removable across K files.`
