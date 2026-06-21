---
name: ponytail-help
description: >
  Quick-reference card for all ponytail modes, skills, and commands.
  One-shot display, not a persistent mode. Trigger: /ponytail-help,
  "ponytail help", "what ponytail commands", "how do I use ponytail".
origin: https://github.com/DietrichGebert/ponytail
---

# Ponytail Help

Display this reference card when invoked. One-shot, do NOT change mode,
write flag files, or persist anything.

## Levels

| Level | Trigger | What changes |
|-------|---------|--------------|
| **Lite** | `/ponytail lite` | Build what's asked, name the lazier alternative in one line. |
| **Full** | `/ponytail` | The ladder enforced: YAGNI → stdlib → native → one line → minimum. Default. |
| **Ultra** | `/ponytail ultra` | YAGNI extremist. Deletion before addition. Challenges requirements before building. |

Level sticks until changed or session end.

## Skills

| Skill | Trigger | What it does |
|-------|---------|--------------|
| **ponytail** | `/ponytail` | Lazy mode itself. Simplest solution that works. |
| **ponytail-review** | `/ponytail-review` | Over-engineering review on diffs. |
| **ponytail-audit** | `/ponytail-audit` | Repo-wide over-engineering audit. |
| **ponytail-debt** | `/ponytail-debt` | Collect all `ponytail:` comments into a debt ledger. |
| **ponytail-gain** | `/ponytail-gain` | Measured-impact scoreboard. |
| **ponytail-help** | `/ponytail-help` | This card. |

## SkillsBuilder Integration Note

In SkillsBuilder, the Ponytail Ladder applies to **business logic only**.
UI/UX/CSS code is governed by the Color Master Palette and Premium UI rules.
The Ladder functions as a **[Plan] phase pre-check** in the PDCA SOP.
