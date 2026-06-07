# Headroom Sync Engine

The sync engine synchronizes browser tabs from Headroom API to local cache for offline access and multi-device sync.

## Features

- **Tab Data Validation**: Comprehensive validation with detailed error reporting
- **API Client with Timeout Handling**: 30s timeout for all HEADROOM_API endpoints
- **Retry Logic for Rate Limiting**: Handle HTTP 429 responses, retry every 30 seconds, max 5 retries
- **Error Handling for 5xx Responses**: Detailed error messages with remediation steps
- **API Response Parsing**: Parse tab data and normalize timestamps to ISO 8601 format
- **Configuration Loading**: Load from `headroom-config/config.json` with environment variable overrides

## Architecture

```
skills/dev/headroom-sync/
??? api-client.ts      # API client with timeout, retry, and error handling
??? config.ts          # Configuration loader with env overrides
??? tab-validator.ts   # Tab data fetching and validation
??? sync-engine.ts     # Main sync engine orchestrator
??? .data/             # Cached data directory
??  ??? tabs.json      # Cached tab data
??  ??? sync-status.json  # Sync status metadata
??? README.md          # This file
```

## Tab Data Validation (`tab-validator.ts`)

The `tab-validator.ts` module provides comprehensive tab data validation and normalization:

### Core Functions

#### `fetchAndValidateTabs()`
Fetch all tabs from Headroom API and validate them.

```typescript
import { fetchAndValidateTabs } from './tab-validator';

const result = await fetchAndValidateTabs();

if (result.success) {
  console.log(result.summary); // Validation summary
  console.log(result.tabs);    // Array of valid Tab objects
}
```

#### `validateTabData(rawTabs)`
Validate and normalize raw tab data from API response.

```typescript
import { validateTabData } from './tab-validator';

const result = validateTabData(rawTabs);
console.log(result.summary.totalTabs);    // Total received
console.log(result.summary.validTabs);    // Valid tabs count
console.log(result.summary.invalidTabs);  // Invalid tabs count
```

#### `formatValidationSummary(summary)`
Generate human-readable validation summary.

```typescript
import { formatValidationSummary, fetchAndValidateTabs } from './tab-validator';

const result = await fetchAndValidateTabs();
if (result.success) {
  console.log(formatValidationSummary(result.summary));
}
```

### Output Format

The validation summary includes:

1. **Counts**: Total, valid, and invalid tab counts
2. **Timestamp Normalization**: Statistics about timestamp conversion
3. **Invalid Tab Details**: Detailed information about each invalid entry
4. **Output Metadata**: Version and sync timestamp

Example output:

```
============================================================
TAB DATA VALIDATION SUMMARY
============================================================

Counts:
  Total tabs received:    10
  Valid tabs:             9
  Invalid tabs:           1

Timestamp Normalization:
  Total timestamps processed:      10
  Converted from number:           2
  Converted from string:           1
  Already valid ISO 8601 format:   7

Output Metadata:
  Version:     1.0
  Sync Time:   2025-06-07T10:00:00.000Z

Invalid Tab Entries:
----------------------------------------
Entry #3:
  Data: {...}
  Errors:
    - Field: id
      Reason: Missing required field
============================================================
VALIDATION COMPLETE
============================================================
```

### Validation Rules

#### Required Fields
- `id` - Tab ID (converted to string)
- `title` - Tab title (converted to string)
- `url` - Tab URL (converted to string)
- `lastAccessed` - Timestamp in ISO 8601 format

#### Optional Fields
- `groupId` - Group ID (converted to string)
- `groupName` - Group name (converted to string)
- `isPinned` - Boolean flag
- `isInactive` - Boolean flag
- `tags` - Array of tag strings

#### Validation Behavior
- Missing required fields → Tab marked as invalid with error details
- Invalid timestamps → Normalized to ISO 8601 format with warning
- Invalid tag arrays → Error logged, tab may still be valid if other fields pass
- Type conversions → Automatic, logged in normalization stats

### Tab Interface

```typescript
interface Tab {
  id: string;
  title: string;
  url: string;
  groupId?: string;
  groupName?: string;
  lastAccessed: string; // ISO 8601
  isPinned: boolean;
  isInactive: boolean;
  tags?: string[];
}
```

### Integration with Sync Engine

The tab validator is automatically integrated into `sync-engine.ts`:

```typescript
import { createSyncEngine } from './sync-engine';

const engine = createSyncEngine();
const result = await engine.syncTabs();

// The result includes validation summary
console.log(result.totalTabs);    // From validation summary
console.log(result.validTabs);    // From validation summary
```

## API Client (`api-client.ts`)

The `HeadroomApiClient` class provides methods for all Headroom API endpoints:

### Methods

- `getTabs()` - Fetch all tabs from `/tabs` endpoint
- `closeTabs(tabIds)` - Close specified tabs via `/tabs/close` POST
- `getGroups()` - Fetch all tab groups from `/groups` endpoint
- `syncPull()` - Pull latest tabs from cloud via `/sync/pull` POST

### Features

- **Timeout**: 30 second default timeout (configurable)
- **Rate Limiting**: Automatic retry with 30s intervals (max 5 retries)
- **Error Handling**: Detailed error messages with remediation steps
- **Data Normalization**: Automatic timestamp normalization to ISO 8601

### Usage

```typescript
import { createHeadroomApiClient } from './api-client';

const client = createHeadroomApiClient({
  apiUrl: 'http://localhost:4000',
  apiKey: process.env.HEADROOM_API_KEY,
});

// Fetch tabs
const result = await client.getTabs();
if (result.success) {
  console.log(result.data.tabs);
}
```

## Configuration (`config.ts`)

Configuration is loaded from `headroom-config/config.json` with environment variable overrides.

### Configuration Options

```typescript
interface SyncConfig {
  apiKey?: string;        // Headroom API key
  apiUrl: string;         // Headroom API base URL (default: http://localhost:4000)
  cloudSync: boolean;     // Enable cloud sync (default: true)
  timeout: number;        // Request timeout in ms (default: 30000)
  maxRetries: number;     // Max retry attempts (default: 5)
  retryInterval: number;  // Retry interval in ms (default: 30000)
  useCacheIfOffline: boolean; // Use cache when API unavailable (default: true)
  cacheTTL: number;       // Cache time-to-live in ms (default: 1800000 / 30 min)
}
```

### Environment Variables

- `HEADROOM_API_KEY` - API key for authentication
- `HEADROOM_API_URL` - Override API base URL
- `HEADROOM_CLOUD_SYNC` - Enable/disable cloud sync (true/false)
- `HEADROOM_TIMEOUT` - Request timeout in milliseconds
- `HEADROOM_MAX_RETRIES` - Maximum retry attempts
- `HEADROOM_RETRY_INTERVAL` - Retry interval in milliseconds

### Usage

```typescript
import { loadConfig, getApiKey, validateApiKey } from './config';

// Load configuration
const config = loadConfig();

// Get API key
const apiKey = getApiKey(config);

// Validate API key
const validation = validateApiKey(apiKey);
if (!validation.valid) {
  console.error(validation.message);
}
```

## Sync Engine (`sync-engine.ts`)

The `SyncEngine` class orchestrates the sync process.

### Methods

- `syncTabs()` - Perform sync and return results
- `getStatus()` - Get current sync status
- `generateSummaryReport()` - Generate human-readable summary

### Sync Result

```typescript
interface SyncResult {
  success: boolean;
  totalTabs: number;
  activeTabs: number;
  inactiveTabs: number;
  lastSync: string; // ISO 8601
  cloudSynced?: boolean;
  tabs: Tab[];
  error?: string;
  retriesUsed?: number;
}
```

### Usage

```typescript
import { createSyncEngine } from './sync-engine';

const engine = createSyncEngine();

// Perform sync
const result = await engine.syncTabs();

if (result.success) {
  console.log(`Synced ${result.totalTabs} tabs`);
  console.log(`Active: ${result.activeTabs}, Inactive: ${result.inactiveTabs}`);
  console.log(`Last sync: ${result.lastSync}`);
} else {
  console.error(`Sync failed: ${result.error}`);
}
```

## Error Handling

### Rate Limiting (429)

When the API returns HTTP 429:

```
Rate Limited, waiting (remaining retries: 4)
```

After 5 retries, returns error:

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMITED",
    "message": "Max retries exceeded for rate-limited request",
    "remediationSteps": [
      "Wait for rate limit to reset",
      "Reduce request frequency",
      "Check Headroom rate limiting policy"
    ]
  }
}
```

### Server Errors (5xx)

Server errors include remediation steps:

```json
{
  "success": false,
  "error": {
    "code": "SERVER_ERROR",
    "message": "Internal server error",
    "remediationSteps": [
      "Check Headroom service status",
      "Verify API key validity",
      "Check network connection",
      "Try restarting the Headroom server"
    ]
  }
}
```

### Timeout Errors

Timeout errors occur when requests exceed the configured timeout:

```json
{
  "success": false,
  "error": {
    "code": "TIMEOUT",
    "message": "Request timeout: 30000ms exceeded",
    "remediationSteps": [
      "Check Headroom service status",
      "Verify API key validity",
      "Check network connection",
      "Try increasing the timeout value"
    ]
  }
}
```

## Usage Example

```typescript
import { createSyncEngine } from './sync-engine';

async function main() {
  try {
    const engine = createSyncEngine();
    
    const result = await engine.syncTabs();
    
    if (result.success) {
      console.log('=== Sync Summary ===');
      console.log(`Total tabs: ${result.totalTabs}`);
      console.log(`Active tabs: ${result.activeTabs}`);
      console.log(`Inactive tabs: ${result.inactiveTabs}`);
      console.log(`Last sync: ${result.lastSync}`);
      
      // Access tab data
      for (const tab of result.tabs) {
        console.log(`- ${tab.title} (${tab.url})`);
      }
    } else {
      console.error('Sync failed:', result.error);
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

main();
```

## Testing

Run the sync engine with:

```bash
HEADROOM_API_KEY=your_api_key node sync-engine.js
```

## Troubleshooting

### API Key Issues

If you see "API key validation failed":

1. Set `HEADROOM_API_KEY` environment variable
2. API key must be 8-64 alphanumeric characters

### Connection Issues

If you see "No internet connection":

1. Check your network connection
2. Verify Headroom server is running
3. Check if `HEADROOM_API_URL` points to correct server

### Rate Limiting

If you see frequent rate limiting:

1. Reduce request frequency
2. Wait for rate limit to reset
3. Check Headroom rate limiting policy

### Cache Usage

When API is unavailable and `useCacheIfOffline` is enabled, the engine will use cached data and output:

```
Using local cache (API unavailable)
```

To force fresh data, disable cache or delete the cache files.