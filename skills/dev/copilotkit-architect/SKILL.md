---
name: copilotkit-architect
description: Strategic planning for CopilotKit AG-UI implementation, focusing on token-efficient state exposure.
---

# CopilotKit Architect

CopilotKit Architect helps you design the agentic layer of your application. It focuses on the **AG-UI (Agent-User Interaction)** protocol and ensures that only high-signal data is exposed to the AI, reducing token waste.

## Core Design Patterns

### 1. Granular Readable State (`useCopilotReadable`)
Avoid exposing the entire global state. Instead, identify specific data relevant to the user's current task.
- **Bad**: Exposing the whole `user` object with metadata.
- **Good**: Exposing `user.activePreferences` and `user.currentTaskContext`.

### 2. Action Hierarchy (`useCopilotAction`)
Define clear boundaries for AI actions.
- **Frontend Actions**: Immediate UI changes, navigation, toasts.
- **Backend Actions**: Data mutation, API calls (handled via `CopilotRuntime`).

### 3. Hierarchical Context (Parent-Child)
Use the `parentId` property in v2 to group related information. This helps the LLM navigate complex data structures without getting overwhelmed.

## Usage Scenarios

### Planning a New Feature
Ask the architect: "How should I structure CopilotKit for a real-time collaborative editor?"
The architect will provide a map of Readables and Actions with specific Zod schema suggestions.

### Token Audit
Run an audit on an existing integration to identify redundant states that can be removed to save costs.

## Trigger Keywords
CopilotKit architecture, AG-UI planning, state exposure, readable design, action strategy, token audit
