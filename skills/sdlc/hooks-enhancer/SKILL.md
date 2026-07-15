---
name: hooks-enhancer
description: Generate IDE-specific hook configurations for automated quality checks.
---

# Hooks Enhancer

Hooks Enhancer generates configuration templates for various IDEs to automate quality checks like formatting, type-checking, and linting during file save or before tool usage.

## Hook Templates

- **auto-formatter**: Runs Prettier, Black, or gofmt after file save.
- **tsc-type-check**: Runs `tsc --noEmit` after TypeScript file modifications.
- **console-log-detector**: Identifies `console.log` or `print` statements.
- **import-validator**: Detects unresolved imports or missing dependencies.

## Output Formats

- **Kiro**: `.kiro/hooks/*.json`
- **Claude Code**: `.claude/settings.json`
- **Cursor**: `hooks/hooks-cursor.json`

## Usage

Generate a hook configuration:
`hooks-enhancer generate <hook-type> --ide <ide-name>`

## Trigger Keywords
hooks, automation, formatter, type-check, IDE config

## Prerequisites
- Node.js (for some formatters)
- Python (for Black)
- Go (for gofmt)
