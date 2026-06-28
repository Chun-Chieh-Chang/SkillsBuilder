# Findings Log

## [2026-06-28] Cross-IDE Global Rules Mapping ✅ Resolved

### Discovery
- Identified need for a comprehensive guide to map and sync SkillsBuilder capabilities (such as YAGNI ladder, Color Master Palette, and 1% skill linking rule) to all local IDE rule bases globally.

### Resolution
- Created `wiki/concepts/global-ide-integration.md` detailing:
  - Integration mechanics (SSOT, DevOS sidecar pointer).
  - One-click command for workspace-scoped agent sync.
  - Manual config adjustments for global Cursor Rules, VS Code Copilot Instructions, Continue json rules, and Roo Code.
- Synced `wiki/index.md` index references.

### Status: ✅ CLOSED

---

## [2026-06-28] headroom-integration Legacy Specs & Redundant Cache Creator ✅ Resolved


### Discovery
- `.kiro/specs/headroom-integration/` directory containing 5 obsolete spec files (design, requirements, tasks, etc.) remained in the workspace.
- `INSTALL.ps1` contained legacy scripting that automatically created a `.data` directory under *all* ECC skills (`agent-shield`, `django-reviewer`, etc.) during sync, resulting in 15 untracked empty `.data` folders. It also contained unnecessary headroom API key format validations.
- `docs/skillsbuilder-handover-and-continuation-guide.md` contained a folder tree mapping that still referenced `headroom-integration`.

### Resolution
- **Obsolete Spec Removal**: Deleted the entire `.kiro/specs/headroom-integration/` directory.
- **INSTALL.ps1 Refactoring**: Removed the directory creation logic (`.data` folders) and headroom API matches from the ECC skills loop.
- **Workspace Cleaning**: Ran `git clean -fd` to purge the 15 empty `.data` folders and `raw/assets/` folder.
- **Document Update**: Corrected the folder tree mapping in the handover guide.

### Status: ✅ CLOSED

---

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
