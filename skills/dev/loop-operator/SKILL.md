---
name: loop-operator
description: Agent execution loop anomaly detection and intervention.
---

# Loop Operator

Loop Operator monitors agent execution loops to detect anomalies such as repetitive tool calls or lack of progress, providing intervention options to the user.

## Features

- **Consecutive Call Detection**: Identifies potential loops if a tool is called >3 times with low output variance.
- **Intervention Options**: Provides choices to abort, restart with a new strategy, or continue.
- **Silence Timeout**: Warns the user if the agent remains inactive for more than 10 minutes.
- **Autonomous Mode**: Integrates with `autonomous-executor` for background monitoring.

## Usage

Loop Operator typically runs in the background during complex tasks. You can also check its current monitoring state:
`loop-operator status`

## Trigger Keywords
loop detection, anomaly detection, agent monitor, silence timeout, execution loop

## Prerequisites
- autonomous-executor (optional, for full integration)
