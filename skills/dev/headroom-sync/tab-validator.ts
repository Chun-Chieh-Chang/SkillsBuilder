/**
 * Tab Data Fetching and Validation Module
 * 
 * This module provides functionality to:
 * - Fetch all tabs from Headroom API /tabs endpoint
 * - Validate and normalize tab data structure
 * - Handle edge cases gracefully
 * - Output detailed validation summary
 */

import { existsSync, writeFileSync, readFileSync } from "fs";
import { join } from "path";
import { createHeadroomApiClient, HeadroomApiClient, ApiResponse } from "./api-client";
import { loadConfig, validateConfig, getApiKey, validateApiKey } from "./config";

// ============================================================================
// Tab Data Structures
// ============================================================================

/**
 * Tab interface representing a browser tab
 */
export interface Tab {
  id: string;
  title: string;
  url: string;
  groupId?: string;
  groupName?: string;
  lastAccessed: string; // ISO 8601 format
  isPinned: boolean;
  isInactive: boolean;
  tags?: string[];
}

/**
 * Validation error details for a tab
 */
export interface ValidationError {
  field: string;
  reason: string;
  value?: any;
}

/**
 * Validation result for a single tab
 */
export interface TabValidationResult {
  tab: Tab | null;
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Validation summary for a batch of tabs
 */
export interface ValidationSummary {
  totalTabs: number;
  validTabs: number;
  invalidTabs: number;
  timestampNormalization: {
    totalProcessed: number;
    convertedFromNumber: number;
    convertedFromString: number;
    alreadyValid: number;
  };
  invalidTabDetails: {
    entryIndex: number;
    tabData: any;
    errors: ValidationError[];
  }[];
  output: {
    version: string;
    syncTimestamp: string;
    tabs: Tab[];
  };
}

/**
 * Fetch and validation result
 */
export interface FetchAndValidateResult {
  success: boolean;
  summary: ValidationSummary;
  tabs: Tab[];
  error?: string;
  rawResponse?: any;
}

// ============================================================================
// Constants
// ============================================================================

const REQUIRED_FIELDS: (keyof Tab)[] = ["id", "title", "url", "lastAccessed"];
const OPTIONAL_FIELDS: (keyof Tab)[] = ["groupId", "groupName", "isPinned", "isInactive", "tags"];

const DEFAULT_VERSION = "1.0";
const TIMESTAMP_FORMAT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Log warning message with context
 */
function logWarning(message: string, context?: Record<string, any>): void {
  const timestamp = new Date().toISOString();
  const contextStr = context ? ` (${JSON.stringify(context)})` : "";
  console.warn(`[WARNING] ${timestamp}: ${message}${contextStr}`);
}

/**
 * Check if timestamp is valid ISO 8601 format
 */
function isValidIso8601(timestamp: string): boolean {
  if (!timestamp || typeof timestamp !== "string") {
    return false;
  }
  
  // Check if it matches ISO 8601 pattern
  if (!TIMESTAMP_FORMAT.test(timestamp)) {
    return false;
  }
  
  // Verify it'"'"'s a valid date
  const date = new Date(timestamp);
  return !isNaN(date.getTime());
}

/**
 * Normalize timestamp to ISO 8601 format
 * Returns: { normalized: string, wasConverted: boolean, conversionType: '"'"'number'"'"' | '"'"'string'"'"' | '"'"'already-valid'"'"' }
 */
function normalizeTimestamp(timestamp: string | number | undefined, entryIndex: number): {
  normalized: string;
  wasConverted: boolean;
  conversionType: '"'"'number'"'"' | '"'"'string'"'"' | '"'"'already-valid'"'"';
  error?: string;
} {
  // Handle undefined or null
  if (timestamp === undefined || timestamp === null) {
    return {
      normalized: new Date().toISOString(),
      wasConverted: true,
      conversionType: '"'"'already-valid'"'"',
      error: '"'"'Missing timestamp, using current time'"'"',
    };
  }

  // If it'"'"'s already a valid ISO 8601 string
  if (typeof timestamp === '"'"'string'"'"' && isValidIso8601(timestamp)) {
    return {
      normalized: timestamp,
      wasConverted: false,
      conversionType: '"'"'already-valid'"'"',
    };
  }

  // If it'"'"'s a number (milliseconds since epoch)
  if (typeof timestamp === '"'"'number'"'"') {
    return {
      normalized: new Date(timestamp).toISOString(),
      wasConverted: true,
      conversionType: '"'"'number'"'"',
    };
  }

  // Try to parse as date string
  if (typeof timestamp === '"'"'string'"'"') {
    const date = new Date(timestamp);
    if (!isNaN(date.getTime())) {
      return {
        normalized: date.toISOString(),
        wasConverted: true,
        conversionType: '"'"'string'"'"',
      };
    }
  }

  // Fallback
  return {
    normalized: new Date().toISOString(),
    wasConverted: true,
    conversionType: '"'"'string'"'"',
    error: `"'"'Invalid timestamp format: ${String(timestamp)}, using current time'"'"`,
  };
}

/**
 * Validate a single tab entry
 */
function validateTabEntry(tabData: any, entryIndex: number): TabValidationResult {
  const errors: ValidationError[] = [];
  const tab: Partial<Tab> = {};

  // Validate required fields
  for (const field of REQUIRED_FIELDS) {
    const value = tabData[field];
    
    if (value === undefined || value === null) {
      errors.push({
        field: String(field),
        reason: '"'"'Missing required field'"'"',
      });
      continue;
    }

    // Type validation
    if (field === '"'"'id'"'"') {
      tab.id = String(value);
    } else if (field === '"'"'title'"'"') {
      tab.title = String(value);
    } else if (field === '"'"'url'"'"') {
      tab.url = String(value);
    } else if (field === '"'"'lastAccessed'"'"') {
      const { normalized, error } = normalizeTimestamp(value, entryIndex);
      if (error) {
        logWarning(error, { entryIndex, field });
      }
      tab.lastAccessed = normalized;
    }
  }

  // Validate and normalize optional fields
  for (const field of OPTIONAL_FIELDS) {
    const value = tabData[field];
    
    if (value === undefined || value === null) {
      continue; // Optional, skip if not present
    }

    if (field === '"'"'groupId'"'"') {
      tab.groupId = String(value);
    } else if (field === '"'"'groupName'"'"') {
      tab.groupName = String(value);
    } else if (field === '"'"'isPinned'"'"') {
      tab.isPinned = Boolean(value);
    } else if (field === '"'"'isInactive'"'"') {
      tab.isInactive = Boolean(value);
    } else if (field === '"'"'tags'"'"') {
      if (Array.isArray(value)) {
        tab.tags = value.map(t => String(t));
      } else {
        errors.push({
          field: String(field),
          reason: '"'"'Tags must be an array of strings'"'"',
          value,
        });
      }
    }
  }

  return {
    tab: errors.length > 0 ? null : (tab as Tab),
    isValid: errors.length === 0,
    errors,
  };
}

// ============================================================================
// Main Validation Logic
// ============================================================================

/**
 * Fetch all tabs from Headroom API and validate them
 */
export async function fetchAndValidateTabs(): Promise<FetchAndValidateResult> {
  const config = loadConfig();
  
  if (!validateConfig(config)) {
    return {
      success: false,
      summary: createEmptyValidationSummary(),
      tabs: [],
      error: '"'"'Invalid configuration'"'"',
    };
  }

  const apiKey = getApiKey(config);
  const keyValidation = validateApiKey(apiKey);
  
  if (!keyValidation.valid) {
    return {
      success: false,
      summary: createEmptyValidationSummary(),
      tabs: [],
      error: keyValidation.message || '"'"'API key validation failed'"'"',
    };
  }

  const apiClient = createHeadroomApiClient({
    apiUrl: config.apiUrl,
    apiKey: config.apiKey,
    timeout: config.timeout,
    maxRetries: config.maxRetries,
    retryInterval: config.retryInterval,
  });

  try {
    const result: ApiResponse<{ tabs: any[] }> = await apiClient.getTabs();
    
    if (!result.success || !result.data) {
      return {
        success: false,
        summary: createEmptyValidationSummary(),
        tabs: [],
        error: result.error?.message || '"'"'Failed to fetch tabs'"'"',
        rawResponse: result,
      };
    }

    // Validate and normalize all tabs
    return validateTabData(result.data.tabs);

  } catch (error) {
    return {
      success: false,
      summary: createEmptyValidationSummary(),
      tabs: [],
      error: error instanceof Error ? error.message : '"'"'Unknown error'"'"',
    };
  }
}

/**
 * Validate and normalize tab data from raw API response
 */
export function validateTabData(rawTabs: any[]): FetchAndValidateResult {
  const results: TabValidationResult[] = [];
  const tabs: Tab[] = [];
  const invalidTabDetails: ValidationSummary["invalidTabDetails"] = [];
  
  // Timestamp normalization stats
  let totalProcessed = 0;
  let convertedFromNumber = 0;
  let convertedFromString = 0;
  let alreadyValid = 0;

  // Process each tab entry
  for (let i = 0; i < rawTabs.length; i++) {
    const entry = rawTabs[i];
    const result = validateTabEntry(entry, i);
    
    results.push(result);
    
    // Update timestamp stats
    if (entry.lastAccessed !== undefined && entry.lastAccessed !== null) {
      totalProcessed++;
      
      const { conversionType } = normalizeTimestamp(entry.lastAccessed, i);
      if (conversionType === '"'"'number'"'"') {
        convertedFromNumber++;
      } else if (conversionType === '"'"'string'"'"') {
        convertedFromString++;
      } else if (conversionType === '"'"'already-valid'"'"') {
        alreadyValid++;
      }
    }

    // Handle invalid entries
    if (!result.isValid) {
      logWarning('"'"'Invalid tab entry detected'"'"', {
        entryIndex: i,
        errors: result.errors,
        tabData: entry,
      });
      
      invalidTabDetails.push({
        entryIndex: i,
        tabData: entry,
        errors: result.errors,
      });
    } else if (result.tab) {
      tabs.push(result.tab);
    }
  }

  const summary: ValidationSummary = {
    totalTabs: rawTabs.length,
    validTabs: tabs.length,
    invalidTabs: invalidTabDetails.length,
    timestampNormalization: {
      totalProcessed,
      convertedFromNumber,
      convertedFromString,
      alreadyValid,
    },
    invalidTabDetails,
    output: {
      version: DEFAULT_VERSION,
      syncTimestamp: new Date().toISOString(),
      tabs,
    },
  };

  return {
    success: true,
    summary,
    tabs,
  };
}

/**
 * Create an empty validation summary for error cases
 */
function createEmptyValidationSummary(): ValidationSummary {
  return {
    totalTabs: 0,
    validTabs: 0,
    invalidTabs: 0,
    timestampNormalization: {
      totalProcessed: 0,
      convertedFromNumber: 0,
      convertedFromString: 0,
      alreadyValid: 0,
    },
    invalidTabDetails: [],
    output: {
      version: DEFAULT_VERSION,
      syncTimestamp: new Date().toISOString(),
      tabs: [],
    },
  };
}

// ============================================================================
// Output Formatting
// ============================================================================

/**
 * Generate human-readable validation summary
 */
export function formatValidationSummary(summary: ValidationSummary): string {
  const lines: string[] = [];

  lines.push("=".repeat(60));
  lines.push("TAB DATA VALIDATION SUMMARY");
  lines.push("=".repeat(60));
  lines.push("");
  
  // Counts
  lines.push("Counts:");
  lines.push(`  Total tabs received:    ${summary.totalTabs}`);
  lines.push(`  Valid tabs:             ${summary.validTabs}`);
  lines.push(`  Invalid tabs:           ${summary.invalidTabs}`);
  lines.push("");

  // Timestamp normalization details
  lines.push("Timestamp Normalization:");
  lines.push(`  Total timestamps processed:      ${summary.timestampNormalization.totalProcessed}`);
  lines.push(`  Converted from number:           ${summary.timestampNormalization.convertedFromNumber}`);
  lines.push(`  Converted from string:           ${summary.timestampNormalization.convertedFromString}`);
  lines.push(`  Already valid ISO 8601 format:   ${summary.timestampNormalization.alreadyValid}`);
  lines.push("");

  // Output metadata
  lines.push("Output Metadata:");
  lines.push(`  Version:     ${summary.output.version}`);
  lines.push(`  Sync Time:   ${summary.output.syncTimestamp}`);
  lines.push("");

  // Invalid tab details
  if (summary.invalidTabDetails.length > 0) {
    lines.push("Invalid Tab Entries:");
    lines.push("-".repeat(40));
    
    for (const invalid of summary.invalidTabDetails) {
      lines.push(`Entry #${invalid.entryIndex}:`);
      lines.push(`  Data: ${JSON.stringify(invalid.tabData, null, 2).split("\n").join("\n  ")}`);
      lines.push("  Errors:");
      for (const error of invalid.errors) {
        lines.push(`    - Field: ${error.field}`);
        lines.push(`      Reason: ${error.reason}`);
        if (error.value !== undefined) {
          lines.push(`      Value: ${JSON.stringify(error.value)}`);
        }
      }
      lines.push("");
    }
  } else {
    lines.push("No invalid tab entries found.");
  }

  lines.push("");
  lines.push("=".repeat(60));
  lines.push("VALIDATION COMPLETE");
  lines.push("=".repeat(60));

  return lines.join("\n");
}

// ============================================================================
// Save Results
// ============================================================================

/**
 * Save validation results to cache
 */
export function saveValidationResults(
  results: FetchAndValidateResult,
  cacheDir: string,
  dataFile: string,
  statusFile: string
): void {
  if (!results.success) {
    return;
  }

  // Ensure cache directory exists
  if (!existsSync(cacheDir)) {
    // In practice, use fs.mkdirSync with recursive option
    console.warn(`Cache directory does not exist: ${cacheDir}`);
    return;
  }

  // Save tabs
  writeFileSync(dataFile, JSON.stringify(results.summary.output, null, 2));

  // Save sync status
  const status = {
    version: DEFAULT_VERSION,
    lastSync: results.summary.output.syncTimestamp,
    status: '"'"'success'"'"',
    tabsSynced: results.summary.validTabs,
    invalidTabs: results.summary.invalidTabs,
    timestampNormalization: results.summary.timestampNormalization,
    error: null,
  };
  writeFileSync(statusFile, JSON.stringify(status, null, 2));
}

// ============================================================================
// Integration with Sync Engine
// ============================================================================

/**
 * Enhanced sync that includes tab validation
 */
export async function syncWithValidation(): Promise<FetchAndValidateResult> {
  // Fetch and validate
  const result = await fetchAndValidateTabs();

  if (result.success) {
    // Determine cache paths
    const cacheDir = join(__dirname, ".data");
    const dataFile = join(cacheDir, "tabs.json");
    const statusFile = join(cacheDir, "sync-status.json");

    // Save results
    saveValidationResults(result, cacheDir, dataFile, statusFile);

    // Log summary
    console.log(formatValidationSummary(result.summary));
  }

  return result;
}

// ============================================================================
// Export
// ============================================================================

export default {
  fetchAndValidateTabs,
  validateTabData,
  formatValidationSummary,
  saveValidationResults,
  syncWithValidation,
  Tab,
  TabValidationResult,
  ValidationSummary,
};
