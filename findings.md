# Findings Log

## [2026-06-28] headroom-* Naming Collision — False Cognate ✅ Resolved

### Discovery
- SkillsBuilder contained 6 `headroom-*` skills (headroom-api, headroom-sync, headroom-search, headroom-auto-close, headroom-local-edit, headroom-config).
- These described a **browser tab manager** (`npm install -g headroom-cli`, `localhost:8080`).
- `headroomlabs-ai/headroom` is a completely different product: an **AI Agent Context Compression Layer** (`pip install headroom-ai`, `localhost:8787`).
- This is a **False Cognate (同名異物)** — same name, entirely different products.

### Root Cause
- The 6 `headroom-*` skills were orphaned artifacts from an unknown prior development session. No DEV_LOG entry, no wiki entry, no external references. Draft-quality (20–144 lines each).

### Resolution
- **刀一**: Deleted all 6 skills. Dependency scan confirmed zero external references — no regression risk.
- **刀三**: Created `wiki/entities/headroom-ai.md` as a reserved knowledge card for the real headroomlabs-ai/headroom tool, with YAGNI Gate conditions for future integration.

### Status: ✅ CLOSED

---


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
