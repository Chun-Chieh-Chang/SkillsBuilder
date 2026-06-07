/**
 * Cache Manager Module for Headroom Search
 * 
 * This module handles cache refresh logic, checking cache timestamps,
 * and auto-triggering sync when cache is stale (>30 minutes).
 */

import { existsSync, writeFileSync, readFileSync, mkdirSync } from 'fs';
import { join } from 'path';

// ============================================================================
// Data Structures
// ============================================================================

export interface CacheMetadata {
  lastRefreshed: string; // ISO 8601
  cacheAgeMinutes: number;
  isStale: boolean;
  syncTriggered?: boolean;
}

export interface CacheConfig {
  cacheDir: string;
  dataFile: string;
  statusFile: string;
  staleThresholdMinutes: number;
}

export interface CacheResult {
  success: boolean;
  tabs: any[];
  cache: CacheMetadata;
  syncTriggered?: boolean;
  error?: string;
}

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_STALE_THRESHOLD_MINUTES = 30;
const DEFAULT_CACHE_DIR = '.data';
const DEFAULT_DATA_FILE = 'tabs.json';
const DEFAULT_STATUS_FILE = 'sync-status.json';

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Check if cache directory exists, create if not
 */
function ensureCacheDir(cacheDir: string): void {
  if (!existsSync(cacheDir)) {
    mkdirSync(cacheDir, { recursive: true });
  }
}

/**
 * Load cache metadata from status file
 */
function loadCacheMetadata(cacheDir: string, statusFile: string): CacheMetadata | null {
  try {
    const statusPath = join(cacheDir, statusFile);
    
    if (!existsSync(statusPath)) {
      return null;
    }
    
    const content = readFileSync(statusPath, 'utf-8');
    const status = JSON.parse(content);
    
    const lastRefreshed = status.lastSync || status.lastRefreshed;
    
    if (!lastRefreshed) {
      return null;
    }
    
    const now = Date.now();
    const refreshedTime = new Date(lastRefreshed).getTime();
    const cacheAgeMinutes = Math.floor((now - refreshedTime) / 60000);
    
    return {
      lastRefreshed,
      cacheAgeMinutes,
      isStale: cacheAgeMinutes > DEFAULT_STALE_THRESHOLD_MINUTES,
    };
  } catch (error) {
    console.error('Failed to load cache metadata:', error);
    return null;
  }
}

/**
 * Update cache metadata with current timestamp
 */
function updateCacheMetadata(cacheDir: string, statusFile: string, syncTriggered?: boolean): CacheMetadata {
  const now = new Date().toISOString();
  
  const metadata: CacheMetadata = {
    lastRefreshed: now,
    cacheAgeMinutes: 0,
    isStale: false,
    syncTriggered,
  };
  
  try {
    ensureCacheDir(cacheDir);
    const statusPath = join(cacheDir, statusFile);
    writeFileSync(statusPath, JSON.stringify(metadata, null, 2));
  } catch (error) {
    console.error('Failed to update cache metadata:', error);
  }
  
  return metadata;
}

/**
 * Load tabs from cache file
 */
function loadTabsFromCache(cacheDir: string, dataFile: string): any[] | null {
  try {
    const dataPath = join(cacheDir, dataFile);
    
    if (!existsSync(dataPath)) {
      return null;
    }
    
    const content = readFileSync(dataPath, 'utf-8');
    const data = JSON.parse(content);
    
    return data.tabs || [];
  } catch (error) {
    console.error('Failed to load tabs from cache:', error);
    return null;
  }
}

// ============================================================================
// Main Cache Logic
// ============================================================================

/**
 * Check cache status and refresh if stale
 * 
 * @param config - Cache configuration
 * @param refreshCallback - Callback function to trigger sync
 * @returns CacheResult with tabs and cache metadata
 */
export function checkAndRefreshCache(
  config: CacheConfig,
  refreshCallback?: () => Promise<any>
): CacheResult {
  const {
    cacheDir = DEFAULT_CACHE_DIR,
    dataFile = DEFAULT_DATA_FILE,
    staleThresholdMinutes = DEFAULT_STALE_THRESHOLD_MINUTES,
  } = config;
  
  // Ensure cache directory exists
  ensureCacheDir(cacheDir);
  
  // Load cache metadata
  const cache = loadCacheMetadata(cacheDir, config.statusFile || DEFAULT_STATUS_FILE);
  
  // If no cache exists, trigger sync
  if (!cache) {
    if (refreshCallback) {
      return triggerCacheRefresh(cacheDir, dataFile, config.statusFile || DEFAULT_STATUS_FILE, refreshCallback);
    }
    
    return {
      success: false,
      tabs: [],
      cache: {
        lastRefreshed: new Date().toISOString(),
        cacheAgeMinutes: 0,
        isStale: true,
      },
      error: 'Cache not found. Please run sync first.',
    };
  }
  
  // If cache is stale and refresh callback provided, trigger sync
  if (cache.isStale && refreshCallback) {
    return triggerCacheRefresh(cacheDir, dataFile, config.statusFile || DEFAULT_STATUS_FILE, refreshCallback);
  }
  
  // Load tabs from cache
  const tabs = loadTabsFromCache(cacheDir, dataFile);
  
  if (!tabs) {
    return {
      success: false,
      tabs: [],
      cache,
      error: 'Cache exists but tabs file not found or empty.',
    };
  }
  
  return {
    success: true,
    tabs,
    cache,
  };
}

/**
 * Trigger cache refresh (sync)
 */
function triggerCacheRefresh(
  cacheDir: string,
  dataFile: string,
  statusFile: string,
  refreshCallback: () => Promise<any>
): CacheResult {
  try {
    // Trigger sync
    refreshCallback();
    
    // Update metadata to show sync was triggered
    updateCacheMetadata(cacheDir, statusFile, true);
    
    // Load fresh data
    const tabs = loadTabsFromCache(cacheDir, dataFile);
    
    if (!tabs) {
      return {
        success: false,
        tabs: [],
        cache: {
          lastRefreshed: new Date().toISOString(),
          cacheAgeMinutes: 0,
          isStale: true,
          syncTriggered: true,
        },
        error: 'Sync triggered but no data returned.',
      };
    }
    
    return {
      success: true,
      tabs,
      cache: {
        lastRefreshed: new Date().toISOString(),
        cacheAgeMinutes: 0,
        isStale: false,
        syncTriggered: true,
      },
    };
  } catch (error) {
    return {
      success: false,
      tabs: [],
      cache: {
        lastRefreshed: new Date().toISOString(),
        cacheAgeMinutes: 0,
        isStale: true,
        syncTriggered: true,
      },
      error: error instanceof Error ? error.message : 'Unknown error during cache refresh',
    };
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Validate cache exists and is not stale
 */
export function isCacheValid(cacheDir: string, statusFile: string): boolean {
  const metadata = loadCacheMetadata(cacheDir, statusFile);
  
  if (!metadata) {
    return false;
  }
  
  return !metadata.isStale;
}

/**
 * Get cache age in minutes
 */
export function getCacheAge(cacheDir: string, statusFile: string): number | null {
  const metadata = loadCacheMetadata(cacheDir, statusFile);
  
  if (!metadata) {
    return null;
  }
  
  return metadata.cacheAgeMinutes;
}

/**
 * Check if cache is stale
 */
export function isCacheStale(cacheDir: string, statusFile: string): boolean {
  const metadata = loadCacheMetadata(cacheDir, statusFile);
  
  if (!metadata) {
    return true; // No cache = stale
  }
  
  return metadata.isStale;
}

// ============================================================================
// Export
// ============================================================================

export default {
  checkAndRefreshCache,
  triggerCacheRefresh,
  isCacheValid,
  getCacheAge,
  isCacheStale,
  loadTabsFromCache,
  loadCacheMetadata,
  updateCacheMetadata,
  ensureCacheDir,
  DEFAULT_STALE_THRESHOLD_MINUTES,
};
