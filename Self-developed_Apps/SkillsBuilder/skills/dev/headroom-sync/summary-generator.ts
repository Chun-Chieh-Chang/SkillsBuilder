/**
 * Sync Summary Generator for Headroom Sync Engine
 * Generates human-readable summary reports after sync operations
 */

import { format } from 'util';

// ============================================================================
// Types and Interfaces
// ============================================================================

/**
 * Tab interface
 */
export interface Tab {
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

/**
 * Sync summary data
 */
export interface SyncSummaryData {
  totalTabs: number;
  activeTabs: number;
  inactiveTabs: number;
  lastSync: string; // ISO 8601
  cloudSynced?: boolean;
  success: boolean;
  error?: string;
}

/**
 * Summary report
 */
export interface SummaryReport {
  title: string;
  lines: string[];
  timestamp: string;
}

// ============================================================================
// Constants
// ============================================================================

const INACTIVE_THRESHOLD_MS = 15 * 60 * 1000; // 15 minutes

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Check if a tab is active based on lastAccessed timestamp
 */
export function isTabActive(tab: Tab, referenceTime: number = Date.now()): boolean {
  const lastAccessed = new Date(tab.lastAccessed).getTime();
  return referenceTime - lastAccessed <= INACTIVE_THRESHOLD_MS;
}

/**
 * Calculate tab counts from an array of tabs
 */
export function calculateTabCounts(tabs: Tab[]): { total: number; active: number; inactive: number } {
  const now = Date.now();
  let active = 0;
  let inactive = 0;

  for (const tab of tabs) {
    if (isTabActive(tab, now)) {
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
 * Format timestamp as ISO 8601
 */
export function formatTimestamp(timestamp: string | Date): string {
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
  return date.toISOString();
}

/**
 * Format duration in human-readable form
 */
export function formatDuration(ms: number): string {
  if (ms < 60000) {
    return `${Math.round(ms / 1000)}s`;
  }
  if (ms < 3600000) {
    return `${Math.round(ms / 60000)}m ${Math.round((ms % 60000) / 1000)}s`;
  }
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  return `${hours}h ${minutes}m`;
}

// ============================================================================
// Summary Generator Class
// ============================================================================

/**
 * Sync Summary Generator
 */
export class SummaryGenerator {
  private referenceTime: number;

  constructor(referenceTime: number = Date.now()) {
    this.referenceTime = referenceTime;
  }

  /**
   * Generate sync summary from tabs array
   */
  generateFromTabs(
    tabs: Tab[],
    cloudSynced?: boolean
  ): SyncSummaryData {
    const counts = calculateTabCounts(tabs);

    return {
      totalTabs: counts.total,
      activeTabs: counts.active,
      inactiveTabs: counts.inactive,
      lastSync: formatTimestamp(this.referenceTime),
      cloudSynced,
      success: true,
    };
  }

  /**
   * Generate sync summary from cached data
   */
  generateFromCache(
    tabs: Tab[],
    lastSync: string,
    cloudSynced?: boolean
  ): SyncSummaryData {
    const counts = calculateTabCounts(tabs);

    return {
      totalTabs: counts.total,
      activeTabs: counts.active,
      inactiveTabs: counts.inactive,
      lastSync: formatTimestamp(lastSync),
      cloudSynced,
      success: true,
    };
  }

  /**
   * Generate failed sync summary
   */
  generateFailure(
    error: string,
    lastSync?: string,
    cloudSynced?: boolean
  ): SyncSummaryData {
    return {
      totalTabs: 0,
      activeTabs: 0,
      inactiveTabs: 0,
      lastSync: lastSync ? formatTimestamp(lastSync) : formatTimestamp(this.referenceTime),
      cloudSynced,
      success: false,
      error,
    };
  }

  /**
   * Generate formatted summary report
   */
  generateReport(summary: SyncSummaryData): SummaryReport {
    const lines: string[] = [];

    // Header
    lines.push('='.repeat(60));
    lines.push('HEADROOM SYNC SUMMARY');
    lines.push('='.repeat(60));
    lines.push('');

    // Status
    if (summary.success) {
      lines.push('✓ Sync completed successfully');
    } else {
      lines.push('✗ Sync failed');
    }
    lines.push('');

    // Summary metrics
    lines.push('Summary Metrics:');
    lines.push(`  Total tabs synced:   ${summary.totalTabs}`);
    lines.push(`  Active tabs:         ${summary.activeTabs}`);
    lines.push(`  Inactive tabs:       ${summary.inactiveTabs}`);
    lines.push('');

    // Last sync timestamp
    lines.push(`Last sync: ${summary.lastSync}`);
    lines.push('');

    // Cloud sync status
    if (summary.cloudSynced !== undefined) {
      if (summary.cloudSynced) {
        lines.push('Cloud sync: Enabled and completed');
      } else {
        lines.push('Cloud sync: Disabled or not yet synced');
      }
    }
    lines.push('');

    // Error (if any)
    if (summary.error) {
      lines.push('Error:');
      lines.push(`  ${summary.error}`);
      lines.push('');
    }

    // Footer
    lines.push('='.repeat(60));
    lines.push(`Report generated: ${formatTimestamp(this.referenceTime)}`);
    lines.push('='.repeat(60));

    return {
      title: summary.success ? 'Sync completed successfully' : 'Sync failed',
      lines,
      timestamp: formatTimestamp(this.referenceTime),
    };
  }

  /**
   * Output formatted summary to string
   */
  toString(summary: SyncSummaryData): string {
    const report = this.generateReport(summary);
    return report.lines.join('\n');
  }

  /**
   * Output formatted summary to console
   */
  log(summary: SyncSummaryData): void {
    const report = this.generateReport(summary);
    for (const line of report.lines) {
      console.log(line);
    }
  }
}

// ============================================================================
// Factory Functions
// ============================================================================

/**
 * Create summary generator instance
 */
export function createSummaryGenerator(referenceTime?: number): SummaryGenerator {
  return new SummaryGenerator(referenceTime);
}

/**
 * Generate sync summary from tabs (convenience function)
 */
export function generateSyncSummary(
  tabs: Tab[],
  cloudSynced?: boolean
): SyncSummaryData {
  const generator = createSummaryGenerator();
  return generator.generateFromTabs(tabs, cloudSynced);
}

/**
 * Generate formatted summary report (convenience function)
 */
export function generateSummaryReport(
  tabs: Tab[],
  cloudSynced?: boolean
): SummaryReport {
  const generator = createSummaryGenerator();
  const summary = generator.generateFromTabs(tabs, cloudSynced);
  return generator.generateReport(summary);
}
