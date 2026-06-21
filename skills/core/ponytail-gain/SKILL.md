---
name: ponytail-gain
description: >
  Show ponytail's measured impact as a compact scoreboard: less code, less
  cost, more speed, from the benchmark medians. One-shot display, not a
  persistent mode, and not a per-repo number. Trigger: /ponytail-gain,
  "ponytail gain", "what does ponytail save", "show ponytail impact",
  "ponytail scoreboard".
origin: https://github.com/DietrichGebert/ponytail
---

# Ponytail Gain

Display this scoreboard when invoked. One-shot: do NOT change mode, write flag
files, or persist anything.

The figures are published benchmark medians from the ponytail project.
Source: https://github.com/DietrichGebert/ponytail/blob/main/benchmarks

## Scoreboard

```
  ponytail gain                     benchmark median

  Lines of code   ~54% less (up to 94% where over-build traps exist)
  API cost        ~20% cheaper
  Latency         ~27% faster
  Safety guards   100% retained (validation, security, a11y)
```

Measured on real Claude Code sessions editing a real open-source repo
(FastAPI + React), against the same agent with no skill.
~54% is the mean across 12 feature tasks (Haiku 4.5, n=4).
