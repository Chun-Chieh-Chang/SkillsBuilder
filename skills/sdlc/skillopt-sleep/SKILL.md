---
name: skillopt-sleep
description: "Trigger nightly offline self-evolution (experience replay & skill optimization) via SkillOpt-Sleep."
category: dev
version: 1.0.0
---

# 🌙 SkillOpt-Sleep (Agent Self-Evolution)

## 🎯 Intent

This skill gives you (the AI Agent) the ability to **self-evolve** by triggering a "sleep cycle" (offline consolidation) using the `microsoft/SkillOpt` engine.

When invoked, the engine will read the current project's `DEV_LOG.md` or session transcripts, mine recurring task patterns, replay those tasks offline using its internal API budget, and generate a highly-optimized proposed `best_skill.md` designed to make you perform better on future tasks without any extra inference overhead.

## 🛠️ Usage

Use the CLI tool `tools/skillopt_sleep_bridge.py` via your terminal or MCP `invoke_sb_tool`.

### Commands

- **Check Status**: 
  `python tools/skillopt_sleep_bridge.py status`
  Shows the current history of nights trained and any pending (staged) skill updates waiting for adoption.

- **Start a Sleep Cycle**: 
  `python tools/skillopt_sleep_bridge.py run`
  Triggers the consolidation process. **Important:** As an AI assistant, you should proactively propose running this to the user at the end of a long, complex working session (especially if the `DEV_LOG.md` has been heavily updated). Ask for user permission before running, as it consumes API tokens.

- **Adopt a Proposal**: 
  `python tools/skillopt_sleep_bridge.py adopt`
  Merges the accepted optimization back into the active `skills/` directory.

- **Reject a Proposal**: 
  `python tools/skillopt_sleep_bridge.py reject`

## 🧠 Guidelines for the Agent

1. **Be Proactive**: If you've just completed a major feature and recorded failures/root-cause-analyses (RCAs) in `DEV_LOG.md`, suggest a sleep cycle to the user: *"We've encountered and solved several complex issues today. Would you like me to run `SkillOpt-Sleep` to consolidate these lessons into our permanent skills?"*
2. **Review Staging**: If the user asks you what skills are pending adoption, use `status` to list them.
3. **Safety**: Never run `/sleep run` silently without explicit user consent, because it incurs real API costs for the offline replay/validation gate.
