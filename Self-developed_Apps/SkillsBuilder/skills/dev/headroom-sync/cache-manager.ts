/**
 * Local Cache Manager for Headroom Sync Engine
 * Handles saving/loading tabs and sync status to/from .data/ directory
 */

import { existsSync, writeFileSync, readFileSync, mkdirSync, unlinkSync, statSync } from 'fs';
import { join } from 'path';

// ============================================================================
// Types and Interfaces
// ============================================================================

/**
 * Tab data in cache
 */
export interface CachedTabs {
  version: string;
  syncTimestamp: string;
  tabs: Tab[];
}

/**
 * Sync status in cache
 */
export interface CachedStatus {
  version: string;
  lastSync: string; // ISO 8601
  syncSuccess: boolean;
  tabsSynced: number;
  cloudSynced: boolean;
  error?: string;
}

/**
 * Cache result
 */
export interface CacheResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  cached: boolean;
}

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_VERSION = '1.0';
const DEFAULT_CACHE_TTL = 30 * 60 * 1000; // 30 minutes

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Ensure cache directory exists
 */
export function ensureCacheDir(cacheDir: string): void {
  if (!existsSync(cacheDir)) {
    try {
      mkdirSync(cacheDir, { recursive: true });
    } catch (error) {
      throw new Error(`Failed to create cache directory: ${cacheDir}`);
    }
  }
}

/**
 * Load JSON file with error handling
 */
function loadJsonFile<T>(filePath: string): T | null {
  try {
    if (!existsSync(filePath)) {
      return null;
    }
    const content = readFileSync(filePath, 'utf-8');
    return JSON.parse(content) as T;
  } catch (error) {
    console.warn(`Failed to load cache file: ${filePath}`, error);
    return null;
  }
}

/**
 * Save JSON file with error handling
 */
function saveJsonFile<T>(filePath: string, data: T): void {
  try {
    const dir = join(filePath, '..');
    ensureCacheDir(dir);
    writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    throw new Error(`Failed to save cache file: ${filePath}`);
  }
}

// ============================================================================
// Cache Manager Class
// ============================================================================

/**
 * Cache Manager for storing and retrieving sync data
 */
export class CacheManager {
  private config: {
    cacheDir: string;
    tabsFile: string;
    statusFile: string;
    cacheTTL: number;
  };

  constructor(config: { cacheDir?: string; tabsFile?: string; statusFile?: string; cacheTTL?: number }) {
    this.config = {
      cacheDir: config.cacheDir || join(__dirname, '.data'),
      tabsFile: config.tabsFile || join(__dirname, '.data', 'tabs.json'),
      statusFile: config.statusFile || join(__dirname, '.data', 'sync-status.json'),
      cacheTTL: config.cacheTTL || DEFAULT_CACHE_TTL,
    };
    
    // Ensure cache directory exists
    ensureCacheDir(this.config.cacheDir);
  }

  /**
   * Save tabs to cache
   */
  saveTabs(tabs: Tab[], syncTimestamp: string): void {
    const cacheData: CachedTabs = {
      version: DEFAULT_VERSION,
      syncTimestamp,
      tabs,
    };
    saveJsonFile(this.config.tabsFile, cacheData);
  }

  /**
   * Save sync status to cache
   */
  saveStatus(status: {
    lastSync: string;
    syncSuccess: boolean;
    tabsSynced: number;
    cloudSynced: boolean;
    error?: string;
  }): void {
    const cacheStatus: CachedStatus = {
      version: DEFAULT_VERSION,
      lastSync: status.lastSync,
      syncSuccess: status.syncSuccess,
      tabsSynced: status.tabsSynced,
      cloudSynced: status.cloudSynced,
      error: status.error,
    };
    saveJsonFile(this.config.statusFile, cacheStatus);
  }

  /**
   * Load tabs from cache
   */
  loadTabs(): CacheResult<CachedTabs> {
    const data = loadJsonFile<CachedTabs>(this.config.tabsFile);
    
    if (!data) {
      return {
        success: false,
        error: 'No cached tabs found',
        cached: false,
      };
    }

    return {
      success: true,
      data,
      cached: true,
    };
  }

  /**
   * Load sync status from cache
   */
  loadStatus(): CacheResult<CachedStatus> {
    const data = loadJsonFile<CachedStatus>(this.config.statusFile);
    
    if (!data) {
      return {
        success: false,
        error: 'No sync status found',
        cached: false,
      };
    }

    return {
      success: true,
      data,
      cached: true,
    };
  }

  /**
   * Check if cache is stale
   */
  isCacheStale(): boolean {
    const statusResult = this.loadStatus();
    
    if (!statusResult.success || !statusResult.data) {
      return true;
    }

    const lastSync = new Date(statusResult.data.lastSync).getTime();
    const now = Date.now();
    const ttl = this.config.cacheTTL;

    return (now - lastSync) > ttl;
  }

  /**
   * Get cache age in milliseconds
   */
  getCacheAge(): number | null {
    const statusResult = this.loadStatus();
    
    if (!statusResult.success || !statusResult.data) {
      return null;
    }

    const lastSync = new Date(statusResult.data.lastSync).getTime();
    return Date.now() - lastSync;
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    try {
      if (existsSync(this.config.tabsFile)) {
        unlinkSync(this.config.tabsFile);
      }
      if (existsSync(this.config.statusFile)) {
        unlinkSync(this.config.statusFile);
      }
    } catch (error) {
      console.warn('Failed to clear cache', error);
    }
  }

  /**
   * Get cache stats
   */
  getCacheStats(): {
    tabsFileExists: boolean;
    statusFileExists: boolean;
    tabsSize?: number;
    statusSize?: number;
    cacheAgeMs?: number;
    isStale: boolean;
  } {
    const tabsExists = existsSync(this.config.tabsFile);
    const statusExists = existsSync(this.config.statusFile);
    
    let tabsSize: number | undefined;
    let statusSize: number | undefined;
    
    if (tabsExists) {
      try {
        tabsSize = statSync(this.config.tabsFile).size;
      } catch {}
    }
    
    if (statusExists) {
      try {
        statusSize = statSync(this.config.statusFile).size;
      } catch {}
    }

    return {
      tabsFileExists: tabsExists,
      statusFileExists: statusExists,
      tabsSize,
      statusSize,
      cacheAgeMs: this.getCacheAge(),
      isStale: this.isCacheStale(),
    };
  }
}

// ============================================================================
// Factory Function
// ============================================================================

/**
 * Create cache manager instance
 */
export function createCacheManager(config?: {
  cacheDir?: string;
  tabsFile?: string;
  statusFile?: string;
  cacheTTL?: number;
}): CacheManager {
  return new CacheManager(config || {});
}
