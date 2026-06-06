---
name: code-reviewer
description: Performs automated audits and code reviews on changes, enforcing styling, security boundaries (no eval/exec), and regression checks.
---

# Code Reviewer (代碼審查)

This skill acts as a gatekeeper of codebase quality, scanning changes for common anti-patterns, import errors, security issues, and visual bugs.

## Trigger Keywords
- "審查代碼", "code review", "檢查 Bug", "dependency scan", "security audit"

## Prerequisites
- Static analysis tools (ESLint, Pylint, or project-specific linters)

## Code Quality Checkpoints

### 1. Security & Execution
- **NO DYNAMIC EXECUTION**: Ensure no usages of `eval()`, `exec()`, or dynamic runtime compiler generation.
- **DATA SANITIZATION**: Check inputs for proper sanitization before database insertion or terminal command building.

### 2. State & Dependencies
- **IMPORTS ACCURACY**: Verify that every package, model, or helper module imported actually exists in the codebase and is listed in the dependencies (`package.json` or `pyproject.toml`).
- **NO BROKEN DEPENDENCIES**: Ensure that removing or renaming a component does not break references in other files.

### 3. UI and Permissions Alignment
- **BUTTON & API ALIGNMENT**: If a backend API is restricted (e.g. `/admin/backups` needs admin rights), check that the corresponding frontend UI elements are conditionally rendered so that non-admin users cannot click them (preventing "403 buttons").

### 4. Code Style & Formatting
- **SPACING & LINT**: Verify there are no unused variables, trailing spaces, or syntax compilation warnings.
- **DOCSTRINGS**: Ensure that public functions have descriptive headers, but preserve any pre-existing unrelated comments/docs.

## Verification Loop
1. Review modified files -> verify: Identify modified regions and compile a list of affected modules.
2. Run syntax and type checks -> verify: Run linter/compiler command and ensure 0 errors.
3. Verify permissions alignment -> verify: Ensure restricted actions match UI button visibility.
