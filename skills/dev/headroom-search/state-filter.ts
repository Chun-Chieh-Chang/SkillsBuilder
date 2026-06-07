/**
 * State Filter Module for Headroom Tabs
 * 
 * This module provides filtering by active/inactive state.
 * Calculates state based on lastAccessed timestamp with configurable threshold.
 */

import { Tab } from './keyword-search';

// ============================================================================
// Data Structures
// ============================================================================

export interface TabState {
  isActive: boolean;
  lastAccessed: string; // ISO 8601
  secondsSinceLastAccess: number;
}

export interface FilterOptions {
  state: 'active' | 'inactive';
  thresholdMinutes?: number;
  limit?: number;
  offset?: number;
}

export interface FilterResponse {
  results: Tab[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasMore: boolean;
  };
  statistics: {
    totalTabs: number;
    activeCount: number;
    inactiveCount: number;
  };
  filterApplied: {
    state: 'active' | 'inactive';
    thresholdMinutes: number;
  };
}

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_THRESHOLD_MINUTES = 15;
const DEFAULT_LIMIT = 10;
const DEFAULT_OFFSET = 0;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Calculate state (active/inactive) for a tab based on lastAccessed
 * 
 * @param tab - Tab to evaluate
 * @param thresholdMinutes - Minutes threshold for active state (default: 15)
 * @returns TabState with isActive status and metadata
 */
export function calculateTabState(
  tab: Tab,
  thresholdMinutes: number = DEFAULT_THRESHOLD_MINUTES
): TabState {
  const now = Date.now();
  const lastAccessed = new Date(tab.lastAccessed).getTime();
  const secondsSinceLastAccess = Math.floor((now - lastAccessed) / 1000);
  const minutesSinceLastAccess = secondsSinceLastAccess / 60;
  
  const isActive = minutesSinceLastAccess <= thresholdMinutes;
  
  return {
    isActive,
    lastAccessed: tab.lastAccessed,
    secondsSinceLastAccess,
  };
}

/**
 * Determine if tab matches state filter
 */
function matchesStateFilter(
  tab: Tab,
  state: 'active' | 'inactive',
  thresholdMinutes: number
): boolean {
  const tabState = calculateTabState(tab, thresholdMinutes);
  
  if (state === 'active') {
    return tabState.isActive;
  } else {
    return !tabState.isActive;
  }
}

// ============================================================================
// Main Filter Logic
// ============================================================================

/**
 * Filter tabs by state (active/inactive)
 * 
 * @param tabs - Array of tabs to filter
 * @param options - Filter options (state, thresholdMinutes, limit, offset)
 * @returns FilterResponse with filtered results and statistics
 */
export function filterByState(
  tabs: Tab[],
  options: FilterOptions
): FilterResponse {
  const {
    state,
    thresholdMinutes = DEFAULT_THRESHOLD_MINUTES,
    limit = DEFAULT_LIMIT,
    offset = DEFAULT_OFFSET,
  } = options;
  
  // Filter tabs by state
  const filteredTabs = tabs.filter(tab =>
    matchesStateFilter(tab, state, thresholdMinutes)
  );
  
  // Calculate statistics
  const activeCount = tabs.filter(tab =>
    calculateTabState(tab, thresholdMinutes).isActive
  ).length;
  
  const inactiveCount = tabs.length - activeCount;
  
  // Apply pagination
  const total = filteredTabs.length;
  const paginatedResults = filteredTabs.slice(offset, offset + limit);
  
  return {
    results: paginatedResults,
    pagination: {
      total,
      page: Math.floor(offset / limit) + 1,
      limit,
      totalPages: Math.ceil(total / limit),
      hasMore: offset + limit < total,
    },
    statistics: {
      totalTabs: tabs.length,
      activeCount,
      inactiveCount,
    },
    filterApplied: {
      state,
      thresholdMinutes,
    },
  };
}

// ============================================================================
// Statistics Functions
// ============================================================================

/**
 * Generate statistics summary for all tabs
 */
export function generateStateSummary(
  tabs: Tab[],
  thresholdMinutes: number = DEFAULT_THRESHOLD_MINUTES
): {
  total: number;
  active: number;
  inactive: number;
  thresholdMinutes: number;
  activePercentage: number;
  inactivePercentage: number;
} {
  const activeCount = tabs.filter(tab =>
    calculateTabState(tab, thresholdMinutes).isActive
  ).length;
  
  const inactiveCount = tabs.length - activeCount;
  const total = tabs.length;
  
  return {
    total,
    active: activeCount,
    inactive: inactiveCount,
    thresholdMinutes,
    activePercentage: total > 0 ? ((activeCount / total) * 100).toFixed(1) : '0.0',
    inactivePercentage: total > 0 ? ((inactiveCount / total) * 100).toFixed(1) : '0.0',
  };
}

/**
 * Get detailed state breakdown with timestamp info
 */
export function getDetailedStateBreakdown(
  tabs: Tab[],
  thresholdMinutes: number = DEFAULT_THRESHOLD_MINUTES
): {
  activeTabs: Tab[];
  inactiveTabs: Tab[];
  stateInfo: Record<string, TabState>;
} {
  const activeTabs: Tab[] = [];
  const inactiveTabs: Tab[] = [];
  const stateInfo: Record<string, TabState> = {};
  
  for (const tab of tabs) {
    const tabState = calculateTabState(tab, thresholdMinutes);
    stateInfo[tab.id] = tabState;
    
    if (tabState.isActive) {
      activeTabs.push(tab);
    } else {
      inactiveTabs.push(tab);
    }
  }
  
  return {
    activeTabs,
    inactiveTabs,
    stateInfo,
  };
}

// ============================================================================
// Export
// ============================================================================

export default {
  filterByState,
  calculateTabState,
  matchesStateFilter,
  generateStateSummary,
  getDetailedStateBreakdown,
  DEFAULT_THRESHOLD_MINUTES,
  DEFAULT_LIMIT,
  DEFAULT_OFFSET,
};
