---
name: diagram-generator
description: Generates clean, structured flowcharts, sequence diagrams, and software architecture diagrams in copy-pasteable Excalidraw JSON format.
---

# Excalidraw Diagram Generator (架構可視化)

This skill enables the agent to design complex flowcharts and architectural diagrams and translate them into a valid Excalidraw JSON structure.

## Trigger Keywords
- "畫架構圖", "流程圖 Excalidraw", "生成圖表", "diagram generator", "draw architecture diagram", "excalidraw json"

## Prerequisites
- None (Standard JSON output)

## Anti-Hallucination Guardrails
- **DO NOT** output plain text representations (like ASCII art) when Excalidraw JSON is requested.
- **NEVER** violate the JSON schema of Excalidraw elements (ensure correct `type`, `x`, `y`, `width`, `height`, `strokeColor`, `backgroundColor`, and `id` values).
- Keep coordinates spaced out so that nodes and text do not overlap.

## Excalidraw JSON Structure Template
An Excalidraw file contains:
```json
{
  "type": "excalidraw",
  "version": 2,
  "source": "https://excalidraw.com",
  "elements": [
    {
      "id": "node1",
      "type": "rectangle",
      "x": 100,
      "y": 100,
      "width": 200,
      "height": 80,
      "strokeColor": "#334155",
      "backgroundColor": "#f8fafc",
      "fillStyle": "solid",
      "strokeWidth": 2,
      "strokeStyle": "solid",
      "roundness": { "type": 3 },
      "roughness": 0,
      "opacity": 100
    }
  ],
  "appState": {
    "viewBackgroundColor": "#ffffff",
    "gridSize": 20
  },
  "files": {}
}
```

## Multi-Phase Workflow

### Phase 1: Discovery
1. Identify the entities, relationships, flow steps, or architectural layers requested by the user.
2. Outline the topology (boxes, diamonds for decisions, arrows, grouping layers).
3. Determine layout parameters (origin coordinates, gap spacing of at least 80px).

### Phase 2: Execution
1. Calculate the coordinates of each shape and connector arrow.
2. Generate the full `elements` list in JSON.
3. Write the JSON payload to `scratch/diagram.excalidraw`.

### Phase 3: Verification
1. Run a validation check on the JSON syntax (ensure no missing commas, keys, or brackets).
2. Check that the coordinates of connections map correctly to source and target nodes.

### Phase 4: Archive (Wiki Synthesis)
1. Instruct the user on how to copy and import the file into [Excalidraw](https://excalidraw.com/).
2. Log the architectural diagram concept or template schema under `wiki/concepts/` if it represents a repeatable system architecture.

## Verification Loop
1. Design layout -> verify: Coordinates of shapes are calculated and overlap-free.
2. Generate diagram file -> verify: `scratch/diagram.excalidraw` is written as valid JSON.
3. Verify file import compatibility -> verify: File starts with `"type": "excalidraw"`.
