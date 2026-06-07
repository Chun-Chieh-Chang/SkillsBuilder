---
name: harness-optimizer
description: Context window management and token cost optimization.
---

# Harness Optimizer

Harness Optimizer helps manage the agent's context window by tracking token usage and suggesting optimization strategies to avoid hitting capacity limits.

## Features

- **Token Usage Tracking**: Reports current token usage and percentage of capacity.
- **Context Pruning Strategies**: Suggests specific actions (like using `graphify query`) to reduce context size.
- **Batching Suggestions**: Recommends batching tasks based on dependency topology for deep structures.
- **Cost Tracking**: Optional per-execution and per-session cost summaries.

## Threshold Alerts

If context usage exceeds 80%, Harness Optimizer will automatically suggest transitioning from full file reads to targeted queries using `graphify`.

## Usage

Check context status:
`harness-optimizer status`

## Trigger Keywords
token usage, context window, optimization, cost tracking, context pruning

## Prerequisites
- graphifyy (for topology analysis)
