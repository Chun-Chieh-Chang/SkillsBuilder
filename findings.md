# Findings Log

## [2026-06-28] DESIGN.md Spec Audit

### Research
- Audited [google-labs-code/design.md](https://github.com/google-labs-code/design.md) — a format spec for describing visual identity to coding agents.
- Compared spec features against SkillsBuilder Color Master Palette, typography rules, spacing grid, dark/light modes.

### Results
- **Semantic alignment**: 100% — all core design concepts already present in SkillsBuilder.
- **Functional conflicts**: None.
- **Format gaps**: No standalone `DESIGN.md` file; no YAML front matter; no `@google/design.md lint` in CI pipeline.

### Actions Taken
- Created `DESIGN.md` (P2): YAML front matter + 8-section prose.
- Integrated lint into `verify.ps1` Step 5 (P3): graceful fallback if npx not available.

---

## [2026-06-07] Initialization Failure — Bootstrap TLS Issue ✅ Resolved

### Root Cause
- `docs/devos-sidecar-guide.html` contained an incomplete bootstrap command missing `[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12;`.
- PowerShell 5.1 defaults to TLS 1.0/1.1, which GitHub deprecated — causing SSL connection failure.

### Resolution
- Correct command confirmed in `GEMINI.md` and `.cursorrules` (includes TLS 1.2 forcing).
- `docs/devos-sidecar-guide.html` was fixed to use the complete, correct command.
- Workspace initialized successfully via local `bootstrap.ps1`.

### Status: ✅ CLOSED
