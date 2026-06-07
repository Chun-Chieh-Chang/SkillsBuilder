# Headroom API Reference

## Overview

This document provides a complete reference for the Headroom API endpoints used by SkillsBuilder. These endpoints allow you to manage browser tabs, groups, and synchronization directly through API calls.

## Base URL

```
http://localhost:8080/api/v1
```

## Endpoints

### `/tabs` - GET

**Description**: Fetch all browser tabs managed by Headroom

**Parameters**: None

**Response**:
```json
{
  "tabs": [
    {
      "id": "tab-123",
      "title": "Example Tab",
      "url": "https://example.com",
      "groupId": "group-456",
      "groupName": "Development",
      "lastAccessed": "2024-01-15T10:30:00Z",
      "isPinned": false,
      "isInactive": false,
      "tags": ["important", "work"]
    }
  ]
}
```

**Usage**: Call this endpoint to retrieve the complete list of open tabs in Headroom.

---

### `/tabs/close` - POST

**Description**: Close specified tabs by ID or group

**Parameters**:
- `tab_ids` (array, optional): Array of tab IDs to close
- `group` (string, optional): Group name to close all tabs in that group

**Parameter Validation**:
- Either `tab_ids` OR `group` must be provided (but not both)
- `tab_ids` must be an array of strings if provided
- `group` must be a non-empty string if provided

**Request Example**:
```json
{
  "tab_ids": ["tab-123", "tab-456"]
}
```

**Alternative Request Example** (by group):
```json
{
  "group": "Development"
}
```

**Response**:
```json
{
  "closedCount": 2,
  "failedTabIds": []
}
```

**Error Responses**:
- `400 Bad Request`: Invalid parameter combination or format
- `401 Unauthorized`: Missing or invalid API key
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server-side error

**Usage**: Use this endpoint to close tabs either by specifying individual tab IDs or by specifying a group name.

**TypeScript Client Method**: `closeTabs(params: { tab_ids?: string[]; group?: string })`

---

### `/groups` - GET / POST

**Description**: 
- GET: Fetch all tab groups configured in Headroom
- POST: Move tabs to a target group

**GET Parameters**: None

**GET Response**:
```json
{
  "groups": [
    {
      "id": "group-456",
      "name": "Development",
      "tabCount": 15,
      "color": "#3B82F6"
    },
    {
      "id": "group-789",
      "name": "Research",
      "tabCount": 8,
      "color": "#10B981"
    }
  ]
}
```

**POST Parameters**:
- `tab_ids` (required): Array of tab IDs to move
- `target_group` (required): Name of the target group

**Parameter Validation**:
- `tab_ids` must be an array of strings
- `target_group` must be a non-empty string

**Request Example**:
```json
{
  "tab_ids": ["tab-123", "tab-456"],
  "target_group": "Research"
}
```

**Response**:
```json
{
  "movedCount": 2,
  "targetGroup": "Research"
}
```

**Error Responses**:
- `400 Bad Request`: Missing or invalid parameters
- `401 Unauthorized`: Missing or invalid API key
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server-side error

**Usage**: 
- GET: Retrieve all configured groups and their details
- POST: Move tabs to a different group

**TypeScript Client Method**: 
- `getGroups()` - GET endpoint
- `moveTabsToGroup(params: { tab_ids: string[]; target_group: string })` - POST endpoint

---

### `/tags` - POST

**Description**: Add or remove tags from tabs

**Parameters**:
- `tab_ids` (required): Array of tab IDs to modify
- `tags` (optional): Array of tags to add
- `remove_tags` (optional): Array of tags to remove

**Parameter Validation**:
- `tab_ids` must be an array of strings
- Either `tags` OR `remove_tags` must be provided (but not both)
- If provided, `tags` must be an array of strings
- If provided, `remove_tags` must be an array of strings

**Request Example** (add tags):
```json
{
  "tab_ids": ["tab-123"],
  "tags": ["important", "work"]
}
```

**Request Example** (remove tags):
```json
{
  "tab_ids": ["tab-456"],
  "remove_tags": ["archive"]
}
```

**Response**:
```json
{
  "updatedCount": 1,
  "operation": "add"
}
```

The `operation` field indicates whether tags were added (`add`) or removed (`remove`).

**Error Responses**:
- `400 Bad Request`: Missing or invalid parameters
- `401 Unauthorized`: Missing or invalid API key
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server-side error

**Usage**: Use this endpoint to tag tabs for easier organization and filtering.

**TypeScript Client Method**: `modifyTags(params: { tab_ids: string[]; tags?: string[]; remove_tags?: string[] })`

---

### `/sync/pull` - POST

**Description**: Pull the latest tab data from Headroom cloud sync

**Parameters**: None

**Request Body**: None

**Response**:
```json
{
  "success": true,
  "tabsSynced": 25,
  "lastSync": "2024-01-15T10:30:00Z"
}
```

**Error Responses**:
- `401 Unauthorized`: Missing or invalid API key
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server-side error

**Usage**: Use this endpoint to synchronize the latest tab data from Headroom's cloud service before fetching tabs locally.

**TypeScript Client Method**: `pullFromCloud()`

---

## Error Responses

### 400 Bad Request

```json
{
  "error": "Invalid request",
  "message": "Missing required parameter: tab_ids"
}
```

### 401 Unauthorized

```json
{
  "error": "Authentication failed",
  "message": "Invalid or missing API key"
}
```

### 429 Too Many Requests

```json
{
  "error": "Rate limit exceeded",
  "message": "Please retry after 30 seconds"
}
```

### 500 Internal Server Error

```json
{
  "error": "Server error",
  "message": "Internal server error occurred"
}
```

---

## API Rate Limiting

Headroom API implements rate limiting to prevent abuse:

- **Limit**: 100 requests per minute
- **Retry After**: 30 seconds for 429 responses
- **Max Retries**: 5 attempts

When rate limited, the API will return a 429 status code with a `Retry-After` header indicating when to retry.

**TypeScript Client Handling**: The `HeadroomApiClient` automatically handles 429 responses with retry logic and exponential backoff.

---

## API Authentication

All API endpoints require authentication via API key:

**Header**:
```
Authorization: Bearer YOUR_API_KEY
```

**Environment Variable**:
Set `HEADROOM_API_KEY` in your environment to use the API.

**TypeScript Client**: The `HeadroomApiClient` automatically adds the Authorization header when an API key is provided in the constructor.

---

## TypeScript Client Usage

### Initialization

```typescript
import HeadroomApiClient from './headroom-api/api-client';
import { HeadroomApiError } from './headroom-api/error-handler';

// Create client with default configuration
const client = new HeadroomApiClient();

// Create client with custom configuration
const client = new HeadroomApiClient({
  baseUrl: 'http://localhost:8080/api/v1',
  apiKey: process.env.HEADROOM_API_KEY,
  timeout: 30000,
});
```

### Error Handling

```typescript
try {
  const result = await client.closeTabs({ tab_ids: ['tab-123'] });
  console.log('Closed tabs:', result.closedCount);
} catch (error) {
  if (error instanceof HeadroomApiError) {
    console.error('API Error:', error.statusCode);
    console.error('Error Type:', error.errorType);
    console.error('Message:', error.message);
    console.error('Details:', error.details);
  } else {
    console.error('Unknown Error:', error);
  }
}
```

### Complete Example

```typescript
import HeadroomApiClient, { HeadroomApiError } from './headroom-api/api-client';

async function main() {
  const client = new HeadroomApiClient({
    baseUrl: 'http://localhost:8080/api/v1',
    apiKey: process.env.HEADROOM_API_KEY,
  });

  try {
    // Fetch all tabs
    const tabsResponse = await client.getTabs();
    console.log('Total tabs:', tabsResponse.tabs.length);

    // Fetch all groups
    const groupsResponse = await client.getGroups();
    console.log('Total groups:', groupsResponse.groups.length);

    // Close tabs by ID
    const closeResult = await client.closeTabs({ 
      tab_ids: ['tab-123', 'tab-456'] 
    });
    console.log('Closed:', closeResult.closedCount, 'tabs');

    // Move tabs to group
    const groupResult = await client.moveTabsToGroup({
      tab_ids: ['tab-789'],
      target_group: 'Development'
    });
    console.log('Moved:', groupResult.movedCount, 'tabs to', groupResult.targetGroup);

    // Add tags to tabs
    const tagResult = await client.modifyTags({
      tab_ids: ['tab-123'],
      tags: ['important', 'work']
    });
    console.log('Updated:', tagResult.updatedCount, 'tabs with operation:', tagResult.operation);

  } catch (error) {
    if (error instanceof HeadroomApiError) {
      // Handle specific API errors
      console.error('Headroom API Error:', error.message);
    } else {
      // Handle other errors
      console.error('Unexpected Error:', error);
    }
  }
}
```

---

## Complete Endpoint Summary

| Endpoint | Method | Description | TypeScript Method |
|----------|--------|-------------|-------------------|
| `/tabs` | GET | Fetch all tabs | `getTabs()` |
| `/tabs/close` | POST | Close tabs by ID or group | `closeTabs(params)` |
| `/groups` | GET | Fetch all groups | `getGroups()` |
| `/groups` | POST | Move tabs to group | `moveTabsToGroup(params)` |
| `/tags` | POST | Add/remove tags | `modifyTags(params)` |
| `/sync/pull` | POST | Pull from cloud sync | `pullFromCloud()` |

---

## Parameter Validation Examples

### Close Operations

```typescript
// Valid: Close by tab IDs
client.closeTabs({ tab_ids: ['tab-123', 'tab-456'] });

// Valid: Close by group
client.closeTabs({ group: 'Development' });

// Invalid: Both provided - Error
client.closeTabs({ tab_ids: ['tab-123'], group: 'Development' });

// Invalid: Neither provided - Error
client.closeTabs({});
```

### Group Operations

```typescript
// Valid: Move tabs to group
client.moveTabsToGroup({
  tab_ids: ['tab-123'],
  target_group: 'Research'
});

// Invalid: Missing target_group - Error
client.moveTabsToGroup({ tab_ids: ['tab-123'] });

// Invalid: Missing tab_ids - Error
client.moveTabsToGroup({ target_group: 'Research' });
```

### Tag Operations

```typescript
// Valid: Add tags
client.modifyTags({
  tab_ids: ['tab-123'],
  tags: ['important']
});

// Valid: Remove tags
client.modifyTags({
  tab_ids: ['tab-123'],
  remove_tags: ['archive']
});

// Invalid: Neither tags nor remove_tags - Error
client.modifyTags({ tab_ids: ['tab-123'] });

// Invalid: Both tags and remove_tags - Error
client.modifyTags({
  tab_ids: ['tab-123'],
  tags: ['important'],
  remove_tags: ['archive']
});
```