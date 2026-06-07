/**
 * Combined AND Search Module for Headroom Tabs
 * 
 * This module combines all search filters (keyword, group, state)
 * with AND logic to return tabs matching ALL criteria.
 */

import { searchByKeyword, Tab as SearchTab } from './keyword-search';
import { filterByGroup, FilterOptions as GroupOptions } from './group-filter';
import { filterByState, FilterOptions as StateOptions } from './state-filter';

// ============================================================================
// Data Structures
// ============================================================================

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

export interface CombinedSearchOptions {
  keyword?: string;
  group?: {
    groupId?: string;
    groupName?: string;
  };
  state?: {
    state: 'active' | 'inactive';
    thresholdMinutes?: number;
  };
  limit?: number;
  offset?: number;
}

export interface CombinedSearchResponse {
  results: Tab[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasMore: boolean;
  };
  statistics: {
    totalMatches: number;
    filtersApplied: {
      keyword?: string;
      group?: {
        groupId?: string;
        groupName?: string;
      };
      state?: 'active' | 'inactive';
    };
  };
}

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_LIMIT = 10;
const DEFAULT_OFFSET = 0;

// ============================================================================
// Main Combined Search Logic
// ============================================================================

/**
 * Combined AND search applying all filters simultaneously
 * 
 * @param tabs - Array of tabs to search
 * @param options - Combined search options
 * @returns CombinedSearchResponse with filtered results
 */
export function combinedSearch(
  tabs: Tab[],
  options: CombinedSearchOptions = {}
): CombinedSearchResponse {
  const {
    keyword,
    group,
    state,
    limit = DEFAULT_LIMIT,
    offset = DEFAULT_OFFSET,
  } = options;
  
  let filteredTabs = tabs;
  
  // Apply keyword filter (case-insensitive, partial match, multiple keywords)
  if (keyword && keyword.trim() !== '') {
    const keywordResults = searchByKeyword(filteredTabs, keyword, {
      limit: filteredTabs.length, // Get all matches for AND logic
      offset: 0,
    });
    
    filteredTabs = keywordResults.results;
  }
  
  // Apply group filter
  if (group && (group.groupId || group.groupName)) {
    const groupOptions: GroupOptions = {
      groupId: group.groupId,
      groupName: group.groupName,
    };
    
    const groupResults = filterByGroup(filteredTabs, groupOptions);
    
    filteredTabs = groupResults.results;
  }
  
  // Apply state filter
  if (state) {
    const stateOptions: StateOptions = {
      state: state.state,
      thresholdMinutes: state.thresholdMinutes,
    };
    
    const stateResults = filterByState(filteredTabs, stateOptions);
    
    filteredTabs = stateResults.results;
  }
  
  // Calculate final pagination
  const total = filteredTabs.length;
  const paginatedResults = filteredTabs.slice(offset, offset + limit);
  
  // Build filters applied summary
  const filtersApplied: CombinedSearchResponse['statistics']['filtersApplied'] = {};
  
  if (keyword) {
    filtersApplied.keyword = keyword;
  }
  
  if (group) {
    filtersApplied.group = {
      groupId: group.groupId,
      groupName: group.groupName,
    };
  }
  
  if (state) {
    filtersApplied.state = state.state;
  }
  
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
      totalMatches: total,
      filtersApplied,
    },
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Check if a single tab matches all search criteria
 * Useful for real-time filtering without full search
 */
export function tabMatchesAllCriteria(
  tab: Tab,
  options: CombinedSearchOptions
): boolean {
  // Keyword filter
  if (options.keyword && options.keyword.trim() !== '') {
    const keywords = options.keyword.split(/\s+/).filter(k => k.length > 0);
    
    for (const keyword of keywords) {
      const titleMatch = tab.title.toLowerCase().includes(keyword.toLowerCase());
      const urlMatch = tab.url.toLowerCase().includes(keyword.toLowerCase());
      
      if (!titleMatch && !urlMatch) {
        return false; // AND logic: all keywords must match
      }
    }
  }
  
  // Group filter
  if (options.group && (options.group.groupId || options.group.groupName)) {
    let groupMatch = false;
    
    if (options.group.groupId && tab.groupId === options.group.groupId) {
      groupMatch = true;
    }
    
    if (options.group.groupName && tab.groupName === options.group.groupName) {
      groupMatch = true;
    }
    
    if (!groupMatch) {
      return false;
    }
  }
  
  // State filter
  if (options.state) {
    const thresholdMinutes = options.state.thresholdMinutes || 15;
    const now = Date.now();
    const lastAccessed = new Date(tab.lastAccessed).getTime();
    const minutesSinceLastAccess = (now - lastAccessed) / 60000;
    
    if (options.state.state === 'active' && minutesSinceLastAccess > thresholdMinutes) {
      return false;
    }
    
    if (options.state.state === 'inactive' && minutesSinceLastAccess <= thresholdMinutes) {
      return false;
    }
  }
  
  return true;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Build a complex query from individual parameters
 * Useful for UI search forms
 */
export function buildSearchQuery(
  keyword?: string,
  group?: {
    groupId?: string;
    groupName?: string;
  },
  state?: 'active' | 'inactive'
): string {
  const parts: string[] = [];
  
  if (keyword) {
    parts.push(`keyword:${keyword}`);
  }
  
  if (group) {
    if (group.groupId) {
      parts.push(`group_id:${group.groupId}`);
    }
    if (group.groupName) {
      parts.push(`group:${group.groupName}`);
    }
  }
  
  if (state) {
    parts.push(`state:${state}`);
  }
  
  return parts.join(' ');
}

/**
 * Parse search query back into options object
 */
export function parseSearchQuery(query: string): CombinedSearchOptions {
  const options: CombinedSearchOptions = {};
  const parts = query.split(/\s+/);
  
  for (const part of parts) {
    if (part.startsWith('keyword:')) {
      options.keyword = part.substring(8);
    } else if (part.startsWith('group_id:')) {
      if (!options.group) options.group = {};
      options.group.groupId = part.substring(9);
    } else if (part.startsWith('group:')) {
      if (!options.group) options.group = {};
      options.group.groupName = part.substring(6);
    } else if (part.startsWith('state:')) {
      options.state = { state: part.substring(6) as 'active' | 'inactive' };
    }
  }
  
  return options;
}

// ============================================================================
// Export
// ============================================================================

export default {
  combinedSearch,
  tabMatchesAllCriteria,
  buildSearchQuery,
  parseSearchQuery,
  DEFAULT_LIMIT,
  DEFAULT_OFFSET,
};
