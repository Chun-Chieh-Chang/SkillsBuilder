---
name: "headroom-api"
description: "Direct Headroom API calls for tab operations (close, group, tag)"
Trigger Keywords:
  - headroom api
  - browser tab management
  - close tabs
  - manage groups
Prerequisites:
  - headroom-cli installed and running
  - Headroom API accessible on localhost:8080
  - HEADROOM_API_KEY environment variable set
---

# Headroom API Skill

**Category**: Development Tools  
**Type**: API Integration

## Overview

This skill provides direct access to Headroom's API for browser tab management operations. You can close tabs, manage groups, and perform tag operations without switching to the browser interface.

## Trigger Keywords

- `headroom api`
- `browser tab management`
- `close tabs`
- `manage groups`

## Prerequisites

Before using this skill, ensure:

1. **headroom-cli** is installed and running:
   ```bash
   npm install -g headroom-cli
   headroom start
   ```

2. **Headroom API** is accessible on `localhost:8080`

3. **API Key** is set as environment variable:
   ```bash
   export HEADROOM_API_KEY="your-api-key-here"
   ```

## Available Actions

### 1. Close Tabs (`action: close`)

Close tabs by ID or group name.

**Parameters**:
- `action`: `"close"`
- `tab_ids` (optional): Array of tab IDs to close
- `group` (optional): Group name to close all tabs in that group

**Example**:
```bash
headroom-api action=close tab_ids=["tab-123", "tab-456"]
headroom-api action=close group="Development"
```

**Response**:
- `closedCount`: Number of tabs successfully closed
- `failedTabIds`: Array of tab IDs that failed to close

---

### 2. Manage Groups (`action: group`)

Move tabs to a different group.

**Parameters**:
- `action`: `"group"`
- `tab_ids`: Array of tab IDs to move
- `target_group`: Name of the target group

**Example**:
```bash
headroom-api action=group tab_ids=["tab-123", "tab-456"] target_group="Research"
```

**Response**:
- `movedCount`: Number of tabs successfully moved
- `targetGroup`: Name of the target group

---

### 3. Tag Tabs (`action: tag`)

Add or remove tags from tabs.

**Parameters**:
- `action`: `"tag"`
- `tab_ids`: Array of tab IDs to modify
- `tags` (optional): Array of tags to add
- `remove_tags` (optional): Array of tags to remove

**Example**:
```bash
headroom-api action=tag tab_ids=["tab-123"] tags=["important", "work"]
headroom-api action=tag tab_ids=["tab-456"] remove_tags=["archive"]
```

**Response**:
- `updatedCount`: Number of tabs successfully updated
- `operation`: Type of operation (`add` or `remove`)

---

## API Reference

For complete API endpoint documentation, see [api-reference.md](./api-reference.md).

## Error Handling

This skill provides detailed error messages for:

- Invalid API parameters
- Missing required fields
- API authentication failures
- Rate limiting (429 responses)
- Server errors (5xx responses)

## Integration with Other Skills

This skill works best when combined with:

- `headroom-sync`: Sync tabs before performing operations
- `headroom-auto-close`: Automate tab closing based on rules
- `headroom-search`: Find tabs to manage

## Quick Start

1. Install and start headroom-cli
2. Set `HEADROOM_API_KEY` environment variable
3. Use one of the trigger keywords to invoke this skill
4. Provide action parameters as described above

---

**Last Updated**: 2024-01-15