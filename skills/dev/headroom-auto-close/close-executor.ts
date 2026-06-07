import { Tab, CloseApiResponse, SummaryReport } from './types';
import { TabFilter, createTabFilter } from './tab-filter';
import { PrivateTabFilter, createPrivateTabFilter } from './private-tab-filter';
import { LockManager, createLockManager } from './lock-manager';
import { RuleParser, createRuleParser, AutoCloseRules } from './rule-parser';
import { SummaryGenerator, createSummaryGenerator } from './summary-generator';

/**
 * 關閉執行器選項
 */
export interface CloseExecutorOptions {
  tabFilter?: TabFilter;
  privateTabFilter?: PrivateTabFilter;
  lockManager?: LockManager;
  summaryGenerator?: SummaryGenerator;
  maxTabsToClose?: number;
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

/**
 * 關閉執行器類
 */
export class CloseExecutor {
  private tabFilter: TabFilter;
  private privateTabFilter: PrivateTabFilter;
  private lockManager: LockManager;
  private summaryGenerator: SummaryGenerator;
  private maxTabsToClose: number;
  private rules: AutoCloseRules;

  constructor(options: CloseExecutorOptions = {}) {
    this.tabFilter = options.tabFilter || createTabFilter();
    this.privateTabFilter = options.privateTabFilter || createPrivateTabFilter();
    this.lockManager = options.lockManager || createLockManager();
    this.summaryGenerator = options.summaryGenerator || createSummaryGenerator();
    
    // 獲取規則以獲取 maxTabsToClose
    const ruleParser = new RuleParser();
    this.rules = ruleParser.parseRules();
    this.maxTabsToClose = options.maxTabsToClose || this.rules.maxTabsToClose;
  }

  /**
   * 執行關閉操作
   * @param tabs 所有分頁
   * @returns 關閉結果
   */
  public async closeTabs(tabs: Tab[]): Promise<CloseResult> {
    console.log('開始關閉分頁程序...');

    // 創建鎖
    const lockResult = await this.lockManager.executeWithLock(async () => {
      console.log('成功獲取鎖');
      return true;
    });

    if (!lockResult) {
      return {
        success: false,
        closedCount: 0,
        failedCount: 0,
        failedTabIds: [],
        summary: this.summaryGenerator.generateEmptyReport(tabs),
      };
    }

    try {
      // 過濾私密分頁
      const filteredTabs = this.privateTabFilter.excludePrivateTabs(tabs);
      console.log(`排除私密分頁: ${tabs.length} -> ${filteredTabs.length}`);

      // 過濾符合關閉條件的分頁
      const filterResult = this.tabFilter.filterTabs(filteredTabs);
      console.log(`過濾結果: ${filterResult.eligibleForClosing.length} 個分頁符合關閉條件`);

      // 適用 maxTabsToClose 限制
      const tabsToClose = filterResult.eligibleForClosing.slice(0, this.maxTabsToClose);
      console.log(`將關閉 ${tabsToClose.length} 個分頁（限制: ${this.maxTabsToClose}）`);

      // 關閉分頁
      const closeResult = await this.executeClose(tabsToClose);

      // 生成摘要報告
      const summary = this.summaryGenerator.generateReport(
        tabs,
        filterResult,
        closeResult,
        this.rules
      );

      return {
        success: closeResult.success,
        closedCount: closeResult.closedCount,
        failedCount: closeResult.failedTabIds.length,
        failedTabIds: closeResult.failedTabIds,
        summary,
      };
    } catch (error) {
      console.error('關閉分頁時出錯:', error);
      
      return {
        success: false,
        closedCount: 0,
        failedCount: tabs.length,
        failedTabIds: tabs.map(tab => tab.id),
        summary: this.summaryGenerator.generateEmptyReport(tabs),
      };
    }
  }

  /**
   * 執行實際的關閉操作
   * @param tabs 要關閉的分頁
   * @returns 關閉結果
   */
  private async executeClose(tabs: Tab[]): Promise<CloseApiResponse> {
    if (tabs.length === 0) {
      console.log('沒有分頁需要關閉');
      return {
        closedCount: 0,
        failedTabIds: [],
        success: true,
        message: '沒有分頁需要關閉',
      };
    }

    const tabIds = tabs.map(tab => tab.id);
    console.log(`關閉 ${tabIds.length} 個分頁:`, tabIds);

    // 這里需要調用 headroom-api skill 的 closeTabs 方法
    // 假設有一個 headroomApiClient 可以調用
    try {
      const result = await this.callHeadroomApi(tabIds);
      
      if (result) {
        return result;
      }
    } catch (error) {
      console.error('調用 Headroom API 失敗:', error);
    }

    // 如果 API 調用失敗，返回失敗結果
    return {
      closedCount: 0,
      failedTabIds: tabIds,
      success: false,
      message: 'API 調用失敗',
    };
  }

  /**
   * 調用 Headroom API
   * @param tabIds 要關閉的分頁 ID
   * @returns API 響應
   */
  private async callHeadroomApi(tabIds: string[]): Promise<CloseApiResponse | null> {
    // 這裡需要導入 headroom-api skill
    // 暫時返回模擬結果
    console.log('調用 headroom-api 要關閉:', tabIds);
    
    // 模擬成功關閉
    return {
      closedCount: tabIds.length,
      failedTabIds: [],
      success: true,
      message: `成功關閉 ${tabIds.length} 個分頁`,
    };
  }

  /**
   * 創建關閉執行器實例
   * @param options 選項
   * @returns CloseExecutor 實例
   */
  public static create(options?: CloseExecutorOptions): CloseExecutor {
    return new CloseExecutor(options);
  }
}

/**
 * 創建關閉執行器實例的工廠函數
 * @param options 選項
 * @returns CloseExecutor 實例
 */
export function createCloseExecutor(options?: CloseExecutorOptions): CloseExecutor {
  return new CloseExecutor(options);
}