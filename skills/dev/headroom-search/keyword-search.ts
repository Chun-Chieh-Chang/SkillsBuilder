/**
 * Keyword Search Module for Headroom Tabs
 * 
 * This module provides keyword search functionality for tab titles and URLs.
 * Supports case-insensitive matching, partial matches, and pagination.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

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

export interface SearchResult {
  tab: Tab;
  score: number;
  matches: {
    title?: boolean;
    url?: boolean;
  };
}

export interface SearchOptions {
  keyword: string;
  limit?: number;
  offset?: number;
}

export interface SearchResponse {
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
    searchTimeMs: number;
  };
}

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;
const DEFAULT_OFFSET = 0;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Load tabs from local cache
 */
export function loadTabsFromCache(cacheDir: string, dataFile: string): Tab[] | null {
  try {
    const fullPath = join(cacheDir, dataFile);
    const content = readFileSync(fullPath, 'utf-8');
    const data = JSON.parse(content);
    return data.tabs || [];
  } catch (error) {
    console.error('Failed to load tabs from cache:', error);
    return null;
  }
}

/**
 * Normalize keyword to lowercase for case-insensitive matching
 */
function normalizeKeyword(keyword: string): string {
  return keyword.toLowerCase().trim();
}

/**
 * Check if text contains keyword (case-insensitive, partial match)
 */
function containsKeyword(text: string, keyword: string): boolean {
  const normalizedText = text.toLowerCase();
  const normalizedKeyword = normalizeKeyword(keyword);
  return normalizedText.includes(normalizedKeyword);
}

/**
 * Calculate match score based on where keyword appears
 * Higher score for matches in title vs URL
 */
function calculateScore(matches: SearchResult['matches']): number {
  let score = 0;
  
  if (matches.title) {
    score += 100; // Title matches are more important
  }
  
  if (matches.url) {
    score += 50; // URL matches are less important
  }
  
  return score;
}

/**
 * Check if tab matches keyword
 */
function matchesKeyword(tab: Tab, keyword: string): SearchResult | null {
  const titleMatch = containsKeyword(tab.title, keyword);
  const urlMatch = containsKeyword(tab.url, keyword);
  
  if (titleMatch || urlMatch) {
    return {
      tab,
      score: calculateScore({ title: titleMatch, url: urlMatch }),
      matches: {
        title: titleMatch,
        url: urlMatch,
      },
    };
  }
  
  return null;
}

// ============================================================================
// Main Search Logic
// ============================================================================

/**
 * Search tabs by keyword
 * 
 * @param tabs - Array of tabs to search
 * @param keyword - Search keyword(s), space-separated
 * @param options - Search options (limit, offset)
 * @returns SearchResponse with paginated results
 */
export function searchByKeyword(
  tabs: Tab[],
  keyword: string,
  options: SearchOptions = {}
): SearchResponse {
  const startTime = Date.now();
  
  const {
    limit = DEFAULT_LIMIT,
    offset = DEFAULT_OFFSET,
  } = options;
  
  // Handle empty keyword - return all tabs
  if (!keyword || keyword.trim() === '') {
    const total = tabs.length;
    const paginatedTabs = tabs.slice(offset, offset + limit);
    
    return {
      results: paginatedTabs,
      pagination: {
        total,
        page: Math.floor(offset / limit) + 1,
        limit,
        totalPages: Math.ceil(total / limit),
        hasMore: offset + limit < total,
      },
      statistics: {
        totalMatches: total,
        searchTimeMs: Date.now() - startTime,
      },
    };
  }
  
  // Split multiple keywords (space-separated)
  const keywords = keyword.split(/\s+/).filter(k => k.length > 0);
  
  // Match tabs against ALL keywords (AND logic)
  const matchedTabs: SearchResult[] = [];
  
  for (const tab of tabs) {
    let allKeywordsMatch = true;
    const matches: SearchResult['matches'] = {};
    
    for (const kw of keywords) {
      const titleMatch = containsKeyword(tab.title, kw);
      const urlMatch = containsKeyword(tab.url, kw);
      
      if (titleMatch || urlMatch) {
        if (titleMatch) matches.title = true;
        if (urlMatch) matches.url = true;
      } else {
        allKeywordsMatch = false;
        break;
      }
    }
    
    if (allKeywordsMatch) {
      matchedTabs.push({
        tab,
        score: calculateScore(matches),
        matches,
      });
    }
  }
  
  // Sort by score (descending) for relevance
  matchedTabs.sort((a, b) => b.score - a.score);
  
  // Apply pagination
  const total = matchedTabs.length;
  const totalMatches = total;
  const paginatedResults = matchedTabs.slice(offset, offset + limit);
  
  const endTime = Date.now();
  
  return {
    results: paginatedResults.map(m => m.tab),
    pagination: {
      total: totalMatches,
      page: Math.floor(offset / limit) + 1,
      limit,
      totalPages: Math.ceil(totalMatches / limit),
      hasMore: offset + limit < totalMatches,
    },
    statistics: {
      totalMatches: totalMatches,
      searchTimeMs: endTime - startTime,
    },
  };
}

// ============================================================================
// Export
// ============================================================================

export default {
  searchByKeyword,
  loadTabsFromCache,
  containsKeyword,
  normalizeKeyword,
  calculateScore,
  matchesKeyword,
  DEFAULT_LIMIT,
  MAX_LIMIT,
};
