/**
 * 分頁類型
 */
export interface Tab {
  id: string;
  title: string;
  url: string;
  groupId: string;
  groupName: string;
  lastAccessed: string;
  active: boolean;
  pinned?: boolean;
  muted?: boolean;
  favIconUrl?: string;
  incognito?: boolean;
  usageFrequency?: number;
}

/**
 * 分頁過濾結果
 */
export interface FilteredTabs {
  eligibleForClosing: Tab[];
  preservedTabs: Tab[];
  reasons: Record<string, string[]>;
}

/**
 * 統計信息
 */
export interface CloseStats {
  totalTabs: number;
  eligibleForClosing: number;
  closedCount: number;
  failedCount: number;
  skippedCount: number;
  failedTabIds: string[];
  skippedReasons: Record<string, string[]>;
}

/**
 * 結果摘要
 */
export interface SummaryReport {
  timestamp: string;
  totalTabs: number;
  filteredCount: number;
  closedCount: number;
  failedCount: number;
  failedTabIds: string[];
  skippedReasons: Record<string, string[]>;
  rulesApplied: {
    inactiveThresholdMinutes: number;
    minUsageFrequency: number;
    groupPriority: {
      high: string[];
      medium: string[];
      low: string[];
    };
    savePrivateTabs: boolean;
    excludedGroups: string[];
  };
}

/**
 * 鎖定信息
 */
export interface LockInfo {
  timestamp: string;
  processId: string;
  isActive: boolean;
}

/**
 * API 響應
 */
export interface CloseApiResponse {
  closedCount: number;
  failedTabIds: string[];
  success: boolean;
  message?: string;
}

/**
 * 日誌消息
 */
export interface LogMessage {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
  details?: Record<string, unknown>;
}

/**
 * 關閉執行結果
 */
export interface CloseResult {
  success: boolean;
  closedCount: number;
  failedCount: number;
  failedTabIds: string[];
  summary: SummaryReport;
}