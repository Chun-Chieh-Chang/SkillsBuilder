/**
 * Sync Engine for Headroom browser tabs
 */

import { existsSync, writeFileSync, readFileSync } from 'fs';
import { join } from 'path';
import { createHeadroomApiClient, HeadroomApiClient, ApiResponse } from './api-client';
import { loadConfig, validateConfig, getApiKey, validateApiKey } from './config';
import { CacheManager, CachedTabs, CachedStatus } from './cache-manager';
import { SummaryGenerator, generateSummaryReport } from './summary-generator';
import { validateTabData } from './tab-validator';

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
  private cacheManager: CacheManager;
  private summaryGenerator: SummaryGenerator;

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

    this.cacheManager = new CacheManager({
      cacheDir: join(__dirname, '.data'),
      tabsFile: join(__dirname, '.data', 'tabs.json'),
      statusFile: join(__dirname, '.data', 'sync-status.json'),
      cacheTTL: this.config.cacheTTL,
    });

    this.summaryGenerator = new SummaryGenerator();
  }

  /**
   * Check if cache should be used (offline mode)
   */
  private shouldUseCache(): boolean {
    return this.config.useCacheIfOffline !== false;
  }

  /**
   * Load tabs from cache
   */
  private loadTabsFromCache(): { tabs: Tab[] } | null {
    const result = this.cacheManager.loadTabs();
    if (result.success && result.data) {
      return { tabs: result.data.tabs };
    }
    return null;
  }

  /**
   * Load status from cache
   */
  private loadStatusFromCache(): CachedStatus | null {
    const result = this.cacheManager.loadStatus();
    if (result.success && result.data) {
      return result.data;
    }
    return null;
  }

  /**
   * Check if cache is stale
   */
  private isCacheStale(): boolean {
    return this.cacheManager.isCacheStale();
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
   * Merge cloud and local tab data
   * Prefers more recent data based on lastAccessed timestamp
   */
  private mergeTabData(cloudTabs: Tab[], localTabs: Tab[]): Tab[] {
    const merged = new Map<string, Tab>();
    
    // Add all local tabs first
    for (const tab of localTabs) {
      merged.set(tab.id, tab);
    }

    // Merge or overwrite with cloud tabs (cloud takes precedence for conflicts)
    for (const cloudTab of cloudTabs) {
      const localTab = merged.get(cloudTab.id);
      
      if (!localTab) {
        // Tab only exists in cloud
        merged.set(cloudTab.id, cloudTab);
      } else {
        // Tab exists in both - use more recent data
        const cloudTime = new Date(cloudTab.lastAccessed).getTime();
        const localTime = new Date(localTab.lastAccessed).getTime();
        
        if (cloudTime > localTime) {
          // Cloud data is more recent
          console.log(`Merging: Using cloud data for tab ${cloudTab.id} (cloud: ${cloudTab.lastAccessed}, local: ${localTab.lastAccessed})`);
          merged.set(cloudTab.id, cloudTab);
        } else {
          // Local data is more recent or equal
          console.log(`Merging: Keeping local data for tab ${cloudTab.id} (cloud: ${cloudTab.lastAccessed}, local: ${localTab.lastAccessed})`);
        }
      }
    }

    return Array.from(merged.values());
  }

  /**
   * Sync tabs from Headroom API with cloud sync integration
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
    if (this.shouldUseCache()) {
      const cachedData = this.loadTabsFromCache();
      const cachedStatus = this.loadStatusFromCache();
      
      if (cachedData && cachedData.tabs && !this.isCacheStale()) {
        const counts = this.calculateTabCounts(cachedData.tabs);
        
        return {
          success: true,
          totalTabs: counts.total,
          activeTabs: counts.active,
          inactiveTabs: counts.inactive,
          lastSync: cachedStatus?.lastSync || new Date().toISOString(),
          cloudSynced: cachedStatus?.cloudSynced,
          tabs: cachedData.tabs,
          retriesUsed: 0,
        };
      }
    }

    try {
      let cloudSynced = false;
      let allTabs: Tab[] = [];

      // Pull from cloud if cloud sync is enabled
      if (this.config.cloudSync) {
        const pullResult = await this.apiClient.syncPull();
        
        if (pullResult.success && pullResult.data && pullResult.data.tabs) {
          cloudSynced = true;
          console.log(`Cloud sync successful: Pulled ${pullResult.data.tabs.length} tabs from cloud`);
          
          // Use cloud tabs as base
          allTabs = pullResult.data.tabs.map(tab => ({
            id: String(tab.id),
            title: String(tab.title),
            url: String(tab.url),
            groupId: tab.groupId ? String(tab.groupId) : undefined,
            groupName: tab.groupName ? String(tab.groupName) : undefined,
            lastAccessed: tab.lastAccessed,
            isPinned: Boolean(tab.isPinned),
            isInactive: Boolean(tab.isInactive),
            tags: Array.isArray(tab.tags) ? tab.tags.map(t => String(t)) : undefined,
          }));
        }
      }

      // Fetch tabs from API (local tabs)
      const tabsResult = await this.apiClient.getTabs();
      
      if (!tabsResult.success || !tabsResult.data) {
        const error = tabsResult.error;
        
        // If cache is available and allowed, use it
        if (this.shouldUseCache() && error?.statusCode === 0) {
          const cachedData = this.loadTabsFromCache();
          
          if (cachedData && cachedData.tabs) {
            const counts = this.calculateTabCounts(cachedData.tabs);
            
            return {
              success: true,
              totalTabs: counts.total,
              activeTabs: counts.active,
              inactiveTabs: counts.inactive,
              lastSync: new Date().toISOString(),
              cloudSynced: false,
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

      const localTabs = tabsResult.data.tabs.map(tab => ({
        id: String(tab.id),
        title: String(tab.title),
        url: String(tab.url),
        groupId: tab.groupId ? String(tab.groupId) : undefined,
        groupName: tab.groupName ? String(tab.groupName) : undefined,
        lastAccessed: tab.lastAccessed,
        isPinned: Boolean(tab.isPinned),
        isInactive: Boolean(tab.isInactive),
        tags: Array.isArray(tab.tags) ? tab.tags.map(t => String(t)) : undefined,
      }));

      // Merge cloud and local tabs
      if (cloudSynced && localTabs.length > 0) {
        console.log(`Merging ${localTabs.length} local tabs with ${allTabs.length} cloud tabs`);
        allTabs = this.mergeTabData(allTabs, localTabs);
      } else {
        allTabs = localTabs;
      }

      const counts = this.calculateTabCounts(allTabs);

      // Save to cache
      this.cacheManager.saveTabs(allTabs, new Date().toISOString());
      
      const syncStatus: CachedStatus = {
        version: '1.0',
        lastSync: new Date().toISOString(),
        syncSuccess: true,
        tabsSynced: allTabs.length,
        cloudSynced,
      };
      this.cacheManager.saveStatus(syncStatus);

      return {
        success: true,
        totalTabs: counts.total,
        activeTabs: counts.active,
        inactiveTabs: counts.inactive,
        lastSync: syncStatus.lastSync,
        cloudSynced,
        tabs: allTabs,
        retriesUsed: tabsResult.remainingRetries,
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Try to use cache on error
      if (this.shouldUseCache()) {
        const cachedData = this.loadTabsFromCache();
        
        if (cachedData && cachedData.tabs) {
          const counts = this.calculateTabCounts(cachedData.tabs);
          
          return {
            success: true,
            totalTabs: counts.total,
            activeTabs: counts.active,
            inactiveTabs: counts.inactive,
            lastSync: new Date().toISOString(),
            cloudSynced: false,
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
  getStatus(): CachedStatus | null {
    return this.loadStatusFromCache();
  }

  /**
   * Generate summary report
   */
  async generateSummaryReport(): Promise<string> {
    const result = await this.syncTabs();
    
    const summary = {
      success: result.success,
      totalTabs: result.totalTabs,
      activeTabs: result.activeTabs,
      inactiveTabs: result.inactiveTabs,
      lastSync: result.lastSync,
      cloudSynced: result.cloudSynced,
      error: result.error,
    };

    const report = generateSummaryReport(result.tabs, result.cloudSynced);
    return report.lines.join('\n');
  }

  /**
   * Get cache stats
   */
  getCacheStats() {
    return this.cacheManager.getCacheStats();
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cacheManager.clearCache();
  }
}

/**
 * Create sync engine instance
 */
export function createSyncEngine(config?: any): SyncEngine {
  return new SyncEngine(config);
}
