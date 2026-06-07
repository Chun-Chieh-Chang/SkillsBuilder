import { AutoCloseRules, RuleParser } from './rule-parser';
import { Tab } from './types';

/**
 * 分頁過濾器接口
 */
export interface TabFilterOptions {
  inactiveThresholdMinutes: number;
  minUsageFrequency: number;
  groupPriority: {
    high: string[];
    medium: string[];
    low: string[];
  };
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
 * 分頁過濾器類
 */
export class TabFilter {
  private rules: AutoCloseRules;

  constructor(rules: AutoCloseRules) {
    this.rules = rules;
  }

  /**
   * 從分頁列表中過濾出符合關閉條件的分頁
   * @param tabs 所有分頁
   * @returns 過濾結果
   */
  public filterTabs(tabs: Tab[]): FilteredTabs {
    const eligibleForClosing: Tab[] = [];
    const preservedTabs: Tab[] = [];
    const reasons: Record<string, string[]> = {};

    for (const tab of tabs) {
      const filterResult = this.shouldPreserveTab(tab);
      
      if (filterResult.shouldPreserve) {
        preservedTabs.push(tab);
        
        if (!reasons[tab.id]) {
          reasons[tab.id] = [];
        }
        reasons[tab.id].push(filterResult.reason);
      } else {
        eligibleForClosing.push(tab);
      }
    }

    return {
      eligibleForClosing,
      preservedTabs,
      reasons,
    };
  }

  /**
   * 檢查分頁是否應該保留
   * @param tab 分頁
   * @returns 是否保留及原因
   */
  private shouldPreserveTab(tab: Tab): { shouldPreserve: boolean; reason: string } {
    // 1. 檢查是否在排除群組中
    if (this.isInExcludedGroup(tab.groupId)) {
      return {
        shouldPreserve: true,
        reason: `在排除群組中: ${tab.groupId}`,
      };
    }

    // 2. 檢查是否為高優先級群組
    if (this.isHighPriorityGroup(tab.groupId)) {
      return {
        shouldPreserve: true,
        reason: `高優先級群組: ${tab.groupId}`,
      };
    }

    // 3. 檢查是否不活躍時間足夠長
    if (!this.isInactiveLongEnough(tab.lastAccessed)) {
      return {
        shouldPreserve: true,
        reason: `不活躍時間不夠: ${this.calculateInactiveMinutes(tab.lastAccessed)} 分鐘`,
      };
    }

    // 4. 檢查使用頻率（如果可用）
    if (this.hasHighUsageFrequency(tab)) {
      return {
        shouldPreserve: true,
        reason: '高使用頻率',
      };
    }

    // 所有條件都符合，可以關閉
    return {
      shouldPreserve: false,
      reason: '符合關閉條件',
    };
  }

  /**
   * 檢查分頁是否在排除群組中
   * @param groupId 群組 ID
   * @returns 是否在排除群組中
   */
  private isInExcludedGroup(groupId: string): boolean {
    return this.rules.excludedGroups.includes(groupId.toLowerCase());
  }

  /**
   * 檢查分頁是否屬於高優先級群組
   * @param groupId 群組 ID
   * @returns 是否為高優先級
   */
  private isHighPriorityGroup(groupId: string): boolean {
    const groupIdLower = groupId.toLowerCase();
    return this.rules.groupPriority.high.some(priority =>
      groupIdLower.includes(priority)
    );
  }

  /**
   * 檢查分頁是否不活躍足夠長時間
   * @param lastAccessed 最後訪問時間
   * @returns 是否不活躍足夠長時間
   */
  private isInactiveLongEnough(lastAccessed: string): boolean {
    const inactiveMinutes = this.calculateInactiveMinutes(lastAccessed);
    return inactiveMinutes >= this.rules.inactiveThresholdMinutes;
  }

  /**
   * 計算分頁不活躍的分鐘數
   * @param lastAccessed 最後訪問時間
   * @returns 不活躍分鐘數
   */
  private calculateInactiveMinutes(lastAccessed: string): number {
    const lastAccessedDate = new Date(lastAccessed);
    const now = new Date();
    const diffMs = now.getTime() - lastAccessedDate.getTime();
    return diffMs / (1000 * 60);
  }

  /**
   * 檢查分頁是否有高使用頻率
   * @param tab 分頁
   * @returns 是否有高使用頻率
   */
  private hasHighUsageFrequency(tab: Tab): boolean {
    // 如果有 usageFrequency 屬性，檢查是否高於最低頻率
    if ('usageFrequency' in tab && tab.usageFrequency !== undefined) {
      return tab.usageFrequency >= this.rules.minUsageFrequency;
    }
    
    // 如果沒有使用頻率信息，假設不頻繁
    return false;
  }

  /**
   * 獲取過濾選項
   * @returns 過濾選項
   */
  public getFilterOptions(): TabFilterOptions {
    return {
      inactiveThresholdMinutes: this.rules.inactiveThresholdMinutes,
      minUsageFrequency: this.rules.minUsageFrequency,
      groupPriority: this.rules.groupPriority,
    };
  }

  /**
   * 創建分頁過濾器實例
   * @param rules 規則
   * @returns TabFilter 實例
   */
  public static create(rules: AutoCloseRules): TabFilter {
    return new TabFilter(rules);
  }
}

/**
 * 創建分頁過濾器實例的工廠函數
 * @param configDir 配置目錄
 * @returns TabFilter 實例
 */
export function createTabFilter(configDir?: string): TabFilter {
  const ruleParser = new RuleParser(configDir);
  const rules = ruleParser.parseRules();
  return new TabFilter(rules);
}