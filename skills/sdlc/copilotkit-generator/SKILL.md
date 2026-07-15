---
name: copilotkit-generator
description: Generate type-safe CopilotKit hooks (useCopilotAction, useCopilotReadable) with Zod validation.
---

# CopilotKit Generator

CopilotKit Generator produces high-quality, production-ready React code for CopilotKit integrations. It enforces type safety and uses Zod for parameter validation to prevent runtime errors from the LLM.

## Coding Standards

### 1. Zod Validation (Mandatory)
Every `useCopilotAction` must have a defined `parameters` array that maps to a Zod schema for the handler.

```typescript
useCopilotAction({
  name: "updateTask",
  description: "Update a task's title or status",
  parameters: [
    { name: "id", type: "string", description: "Task ID" },
    { name: "updates", type: "object", description: "Fields to update", 
      attributes: [
        { name: "title", type: "string", required: false },
        { name: "completed", type: "boolean", required: false }
      ]
    }
  ],
  handler: async ({ id, updates }) => {
    // Validated by Zod internally in production-ready templates
    await api.tasks.update(id, updates);
  },
});
```

### 2. Generative UI (GenUI)
Produce actions that include a `render` property to show custom React components during tool execution.

## Templates Provided
- **Basic Action**: Simple function trigger.
- **Complex Action**: Nested objects with Zod validation.
- **Context Reader**: Typed `useCopilotReadable` with cleanup logic.
- **CoAgent Bridge**: LangGraph-compatible action definitions.

## Trigger Keywords
generate copilot action, copilotkit code, react AI hooks, Zod validation, GenUI template
