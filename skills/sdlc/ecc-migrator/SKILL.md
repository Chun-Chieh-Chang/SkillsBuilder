---
name: ecc-migrator
description: Convert ECC Workflow Skills to SkillsBuilder format.
---

# ECC Migrator

ECC Migrator is a bridge tool that converts ECC (Everything Claude Code) Workflow Skills into SkillsBuilder-compatible `SKILL.md` files.

## Features

- **Format Detection**: Supports both YAML and Markdown ECC skill sources.
- **Automatic Translation**: Maps ECC fields to SkillsBuilder YAML frontmatter.
- **Review System**: Annotates potential issues with `[REVIEW NEEDED]` comments for manual verification.
- **Cross-IDE Guide**: Appends triggering instructions for Kiro, Claude Code, and Cursor.

## Usage

Convert an ECC skill:
`ecc-migrator migrate path/to/ecc-skill.yaml`

## Trigger Keywords
ECC migration, skill conversion, workflow bridge, skill import

## Prerequisites
- ecc-compatibility-matrix.md
