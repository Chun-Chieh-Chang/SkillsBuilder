---
name: copilotkit-v2-bridge
description: Migration and advanced patterns for CopilotKit v2, including CoAgents and LangGraph integration.
---

# CopilotKit v2 Bridge

CopilotKit v2 Bridge specializes in the latest agentic patterns introduced in v2.x. It helps developers transition from v1 (Chat-centric) to v2 (Agent-centric) and integrate with backend frameworks like LangGraph.

## v2 Core Concepts

### 1. The `useAgent` Hook
Move beyond simple actions to full state-syncing agents.
- **Pattern**: `const { state, error } = useAgent<MyState>({ name: "my_agent" });`
- **Benefit**: Automatic streaming of partial state updates from the backend.

### 2. CoAgents & LangGraph
Bridge the gap between frontend UI and long-running Python/JS agents.
- **Human-in-the-Loop (HITL)**: Implement "Interrupt" patterns where the agent waits for user input via a GenUI component.
- **State Handoffs**: Logic for passing context between different specialized agents.

### 3. Migration Guide (v1 -> v2)
- Remapping `useCopilotAction` to the newer `useFrontendTool` where applicable.
- Adjusting Runtime configurations to use the new AG-UI endpoints.

## Advanced Patterns
- **Multi-Agent Orchestration**: Coordinating multiple agents within a single frontend context.
- **Local Persistence**: Strategies for keeping agent state across page reloads.

## Trigger Keywords
CopilotKit v2, migration v1 to v2, CoAgents, LangGraph integration, useAgent hook, agentic frontend
