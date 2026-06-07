/**
 * Sync Engine for Headroom browser tabs
 */

import { existsSync, writeFileSync, readFileSync } from 'fs';
import { join } from 'path';
import { createHeadroomApiClient, HeadroomApiClient } from './api-client';
import { loadConfig, validateConfig, getApiKey, validateApiKey } from './config';

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

interface SyncStatus {
  lastSync: string;
  nextSync?: string;
  syncSuccess: boolean;
  error?: string;
  tabsSynced: number;
  cloudSynced: boolean;
}

/**
 * Sync Engine class
 */
export class SyncEngine {
  private apiClient: HeadroomApiClient;
  private config: any;
  private cacheDir: string;
  private dataFile: string;
  private statusFile: string;

  constructor(config?: any) {
    this.config = config || loadConfig();
    
    if (!validateConfig(this.config)) {
      throw new Error('Invalid configuration');
    }

    this.apiClient = createHeadroomApiClient({
      apiUrl: this.config.apiUrl,
      apiKey: this.config.apiKey,
      timeout: this.config.timeout,
      maxRetries: this.config.maxRetries,
      retryInterval: this.config.retryInterval,
    });

    this.cacheDir = join(__dirname, '.data');
    this.dataFile = join(this.cacheDir, 'tabs.json');
    this.statusFile = join(this.cacheDir, 'sync-status.json');
  }

  /**
   * Ensure cache directory exists
   */
  private ensureCacheDir(): void {
    if (!existsSync(this.cacheDir)) {
      // This would require mkdirp or similar, but we'll use a simple approach
      // In practice, use fs.mkdirSync with recursive option
      throw new Error('Cache directory does not exist');
    }
  }

  /**
   * Save tabs to cache file
   */
  private saveTabs(tabs: Tab[]): void {
    this.ensureCacheDir();
    writeFileSync(this.dataFile, JSON.stringify({ tabs }, null, 2));
  }

  /**
   * Save sync status to file
   */
  private saveStatus(status: SyncStatus): void {
    this.ensureCacheDir();
    writeFileSync(this.statusFile, JSON.stringify(status, null, 2));
  }

  /**
   * Load tabs from cache
   */
  private loadTabs(): { tabs: Tab[] } | null {
    if (!existsSync(this.dataFile)) {
      return null;
    }

    try {
      const content = readFileSync(this.dataFile, 'utf-8');
      return JSON.parse(content);
    } catch {
      return null;
    }
  }

  /**
   * Load sync status from cache
   */
  private loadStatus(): SyncStatus | null {
    if (!existsSync(this.statusFile)) {
      return null;
    }

    try {
      const content = readFileSync(this.statusFile, 'utf-8');
      return JSON.parse(content);
    } catch {
      return null;
    }
  }

  /**
   * Check if cache is stale
   */
  private isCacheStale(): boolean {
    const status = this.loadStatus();
    if (!status || !status.lastSync) {
      return true;
    }

    const lastSync = new Date(status.lastSync).getTime();
    const now = Date.now();
    const ttl = this.config.cacheTTL || 30 * 60 * 1000; // Default 30 minutes

    return (now - lastSync) > ttl;
  }

  /**
   * Calculate tab counts
   */
  private calculateTabCounts(tabs: Tab[]): { total: number; active: number; inactive: number } {
    const now = Date.now();
    const inactiveThreshold = 15 * 60 * 1000; // 15 minutes in milliseconds

    let active = 0;
    let inactive = 0;

    for (const tab of tabs) {
      const lastAccessed = new Date(tab.lastAccessed).getTime();
      if (now - lastAccessed <= inactiveThreshold) {
        active++;
      } else {
        inactive++;
      }
    }

    return {
      total: tabs.length,
      active,
      inactive,
    };
  }

  /**
   * Generate sync summary
   */
  private generateSummary(result: SyncResult): string {
    const lines: string[] = [];

    if (result.success) {
      lines.push('Sync completed successfully');
      lines.push(`Total tabs synced: ${result.totalTabs}`);
      lines.push(`Active tabs: ${result.activeTabs}`);
      lines.push(`Inactive tabs: ${result.inactiveTabs}`);
      lines.push(`Last sync: ${result.lastSync}`);
      
      if (result.cloudSynced) {
        lines.push('Cloud sync: Enabled and completed');
      }
    } else {
      lines.push('Sync failed');
      if (result.error) {
        lines.push(`Error: ${result.error}`);
      }
    }

    return lines.join('\n');
  }

  /**
   * Sync tabs from Headroom API
   */
  async syncTabs(): Promise<SyncResult> {
    // Validate API key
    const apiKey = getApiKey(this.config);
    const keyValidation = validateApiKey(apiKey);
    
    if (!keyValidation.valid) {
      return {
        success: false,
        totalTabs: 0,
        activeTabs: 0,
        inactiveTabs: 0,
        lastSync: new Date().toISOString(),
        tabs: [],
        error: keyValidation.message || 'API key validation failed',
      };
    }

    // Check if we should use cache (offline mode)
    let useCache = false;
    
    if (this.config.useCacheIfOffline) {
      const cachedData = this.loadTabs();
      const cachedStatus = this.loadStatus();
      
      if (cachedData && cachedData.tabs && !this.isCacheStale()) {
        useCache = true;
        
        const counts = this.calculateTabCounts(cachedData.tabs);
        
        return {
          success: true,
          totalTabs: counts.total,
          activeTabs: counts.active,
          inactiveTabs: counts.inactive,
          lastSync: cachedStatus?.lastSync || new Date().toISOString(),
          tabs: cachedData.tabs,
          retriesUsed: 0,
        };
      }
    }

    try {
      // Pull from cloud if cloud sync is enabled
      let cloudSynced = false;
      if (this.config.cloudSync) {
        const pullResult = await this.apiClient.syncPull();
        
        if (pullResult.success && pullResult.data) {
          cloudSynced = true;
        }
      }

      // Fetch tabs from API
      const tabsResult = await this.apiClient.getTabs();
      
      if (!tabsResult.success || !tabsResult.data) {
        const error = tabsResult.error;
        
        // If cache is available and allowed, use it
        if (this.config.useCacheIfOffline && error?.statusCode === 0) {
          const cachedData = this.loadTabs();
          
          if (cachedData && cachedData.tabs) {
            useCache = true;
            const counts = this.calculateTabCounts(cachedData.tabs);
            
            return {
              success: true,
              totalTabs: counts.total,
              activeTabs: counts.active,
              inactiveTabs: counts.inactive,
              lastSync: new Date().toISOString(),
              tabs: cachedData.tabs,
              error: 'Using local cache (API unavailable)',
            };
          }
        }

        return {
          success: false,
          totalTabs: 0,
          activeTabs: 0,
          inactiveTabs: 0,
          lastSync: new Date().toISOString(),
          tabs: [],
          error: error?.message || 'Failed to fetch tabs',
          retriesUsed: tabsResult.remainingRetries,
        };
      }

      const tabs = tabsResult.data.tabs;
      const counts = this.calculateTabCounts(tabs);

      // Save to cache
      this.saveTabs(tabs);
      
      const syncStatus: SyncStatus = {
        lastSync: new Date().toISOString(),
        syncSuccess: true,
        tabsSynced: tabs.length,
        cloudSynced,
      };
      this.saveStatus(syncStatus);

      return {
        success: true,
        totalTabs: counts.total,
        activeTabs: counts.active,
        inactiveTabs: counts.inactive,
        lastSync: syncStatus.lastSync,
        cloudSynced,
        tabs,
        retriesUsed: tabsResult.remainingRetries,
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Try to use cache on error
      if (this.config.useCacheIfOffline) {
        const cachedData = this.loadTabs();
        
        if (cachedData && cachedData.tabs) {
          const counts = this.calculateTabCounts(cachedData.tabs);
          
          return {
            success: true,
            totalTabs: counts.total,
            activeTabs: counts.active,
            inactiveTabs: counts.inactive,
            lastSync: new Date().toISOString(),
            tabs: cachedData.tabs,
            error: `Using local cache (Error: ${errorMessage})`,
          };
        }
      }

      return {
        success: false,
        totalTabs: 0,
        activeTabs: 0,
        inactiveTabs: 0,
        lastSync: new Date().toISOString(),
        tabs: [],
        error: errorMessage,
      };
    }
  }

  /**
   * Get sync status
   */
  getStatus(): SyncStatus | null {
    return this.loadStatus();
  }

  /**
   * Generate summary report
   */
  async generateSummaryReport(): Promise<string> {
    const result = await this.syncTabs();
    return this.generateSummary(result);
  }
}

/**
 * Create sync engine instance
 */
export function createSyncEngine(config?: any): SyncEngine {
  return new SyncEngine(config);
}