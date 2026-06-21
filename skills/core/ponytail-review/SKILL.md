---
name: ponytail-review
description: >
  Code review focused exclusively on over-engineering. Finds what to delete:
  reinvented standard library, unneeded dependencies, speculative abstractions,
  dead flexibility. One line per finding: location, what to cut, what replaces
  it. Use when the user says "review for over-engineering", "what can we
  delete", "is this over-engineered", "simplify review", or invokes
  /ponytail-review. Complements correctness-focused review — this one only
  hunts complexity. Scoped to business logic only (UI/CSS excluded).
origin: https://github.com/DietrichGebert/ponytail
---

# Ponytail Review

Review diffs for unnecessary complexity in **business logic** code only.
One line per finding: location, what to cut, what replaces it.
The diff's best outcome is getting shorter.

**Scope exclusion**: UI components, CSS, design tokens, and animation code
are governed by the Color Master Palette — do not flag those as over-engineered.

## Format

`L<line>: <tag> <what>. <replacement>.`, or `<file>:L<line>: ...` for
multi-file diffs.

Tags:

- `delete:` dead code, unused flexibility, speculative feature. Replacement: nothing.
- `stdlib:` hand-rolled thing the standard library ships. Name the function.
- `native:` dependency or code doing what the platform already does. Name the feature.
- `yagni:` abstraction with one implementation, config nobody sets, layer with one caller.
- `shrink:` same logic, fewer lines. Show the shorter form.

## Output

End with a one-line summary: `N findings, ~M lines removable.`
