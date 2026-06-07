/**
 * Group Filter Module for Headroom Tabs
 * 
 * This module provides filtering functionality by groupId or groupName.
 * Supports sorting by lastAccessed (descending) and pagination.
 */

import { Tab } from './keyword-search';

// ============================================================================
// Data Structures
// ============================================================================

export interface FilterOptions {
  groupId?: string;
  groupName?: string;
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
  filterApplied: {
    groupId?: string;
    groupName?: string;
  };
}

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_LIMIT = 10;
const DEFAULT_OFFSET = 0;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Check if tab matches group filter
 */
function matchesGroupFilter(tab: Tab, options: FilterOptions): boolean {
  // If no group filter specified, match all tabs
  if (!options.groupId && !options.groupName) {
    return true;
  }
  
  // Check groupId if specified
  if (options.groupId) {
    if (tab.groupId === options.groupId) {
      return true;
    }
  }
  
  // Check groupName if specified
  if (options.groupName) {
    if (tab.groupName === options.groupName) {
      return true;
    }
  }
  
  return false;
}

/**
 * Sort tabs by lastAccessed timestamp (descending - most recent first)
 */
function sortByLastAccessed(tabs: Tab[]): Tab[] {
  return [...tabs].sort((a, b) => {
    const dateA = new Date(a.lastAccessed).getTime();
    const dateB = new Date(b.lastAccessed).getTime();
    return dateB - dateA; // Descending: most recent first
  });
}

// ============================================================================
// Main Filter Logic
// ============================================================================

/**
 * Filter tabs by group (groupId or groupName)
 * 
 * @param tabs - Array of tabs to filter
 * @param options - Filter options (groupId, groupName, limit, offset)
 * @returns FilterResponse with filtered and sorted results
 */
export function filterByGroup(
  tabs: Tab[],
  options: FilterOptions = {}
): FilterResponse {
  const {
    groupId,
    groupName,
    limit = DEFAULT_LIMIT,
    offset = DEFAULT_OFFSET,
  } = options;
  
  // Filter tabs by group criteria
  const filteredTabs = tabs.filter(tab => matchesGroupFilter(tab, options));
  
  // Sort by lastAccessed (descending)
  const sortedTabs = sortByLastAccessed(filteredTabs);
  
  // Apply pagination
  const total = sortedTabs.length;
  const paginatedResults = sortedTabs.slice(offset, offset + limit);
  
  return {
    results: paginatedResults,
    pagination: {
      total,
      page: Math.floor(offset / limit) + 1,
      limit,
      totalPages: Math.ceil(total / limit),
      hasMore: offset + limit < total,
    },
    filterApplied: {
      groupId,
      groupName,
    },
  };
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get unique group IDs from tabs
 */
export function getUniqueGroupIds(tabs: Tab[]): string[] {
  const groupIds = tabs
    .map(tab => tab.groupId)
    .filter((id): id is string => id !== undefined && id !== null);
  
  return [...new Set(groupIds)];
}

/**
 * Get unique group names from tabs
 */
export function getUniqueGroupNames(tabs: Tab[]): string[] {
  const groupNames = tabs
    .map(tab => tab.groupName)
    .filter((name): name is string => name !== undefined && name !== null);
  
  return [...new Set(groupNames)];
}

/**
 * Get group statistics
 */
export function getGroupStatistics(tabs: Tab[]): {
  totalGroups: number;
  uniqueGroupIds: string[];
  uniqueGroupNames: string[];
  tabsPerGroup: Record<string, number>;
} {
  const groupIds = getUniqueGroupIds(tabs);
  const groupNames = getUniqueGroupNames(tabs);
  
  // Count tabs per group
  const tabsPerGroup: Record<string, number> = {};
  
  for (const tab of tabs) {
    const groupId = tab.groupId || 'ungrouped';
    tabsPerGroup[groupId] = (tabsPerGroup[groupId] || 0) + 1;
  }
  
  return {
    totalGroups: groupIds.length + groupNames.length - groupIds.length, // Deduplicate
    uniqueGroupIds: groupIds,
    uniqueGroupNames: groupNames,
    tabsPerGroup,
  };
}

// ============================================================================
// Export
// ============================================================================

export default {
  filterByGroup,
  matchesGroupFilter,
  sortByLastAccessed,
  getUniqueGroupIds,
  getUniqueGroupNames,
  getGroupStatistics,
  DEFAULT_LIMIT,
  DEFAULT_OFFSET,
};
