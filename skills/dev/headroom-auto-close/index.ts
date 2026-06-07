/**
 * Headroom Auto-Close 主模塊
 * 提供自動關閉瀏覽器分頁的完整解決方案
 */

import { CloseExecutor, createCloseExecutor } from './close-executor';
import { Tab, CloseResult } from './types';

/**
 * 執行自動關閉
 * @param tabs 所有分頁
 * @returns 關閉結果
 */
export async function autoCloseTabs(tabs: Tab[]): Promise<CloseResult> {
  const executor = createCloseExecutor();
  const result = await executor.closeTabs(tabs);
  
  // 輸出摘要
  console.log('\n' + result.summary + '\n');
  
  // 返回結果
  return result;
}

/**
 * 創建執行器
 * @returns CloseExecutor 實例
 */
export function createAutoCloseExecutor(): CloseExecutor {
  return createCloseExecutor();
}

// 導出所有組件（排除重複的類型）
export { 
  AutoCloseRules, 
  DEFAULT_RULES, 
  createRuleParser, 
  RuleParser 
} from './rule-parser';

export { 
  Tab, 
  FilteredTabs, 
  CloseStats, 
  SummaryReport, 
  LockInfo, 
  CloseApiResponse, 
  LogMessage, 
  CloseResult 
} from './types';

export { 
  TabFilter, 
  createTabFilter, 
  TabFilterOptions 
} from './tab-filter';

export { 
  PrivateTabFilter, 
  createPrivateTabFilter, 
  PrivateTabFilterOptions 
} from './private-tab-filter';

export { 
  LockManager, 
  createLockManager, 
  LockManagerOptions,
  LockInfo as LockInfoType 
} from './lock-manager';

export { 
  CloseExecutor, 
  createCloseExecutor, 
  CloseExecutorOptions 
} from './close-executor';

export { 
  SummaryGenerator, 
  createSummaryGenerator 
} from './summary-generator';