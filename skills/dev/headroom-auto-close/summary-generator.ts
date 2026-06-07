import { AutoCloseRules, RuleParser } from './rule-parser';
import { Tab, FilteredTabs, CloseApiResponse, SummaryReport } from './types';

/**
 * 摘要生成器類
 */
export class SummaryGenerator {
  /**
   * 生成關閉操作摘要報告
   * @param allTabs 所有分頁
   * @param filteredResult 過濾結果
   * @param closeResult 關閉結果
   * @param rules 應用的規則
   * @returns 摘要報告
   */
  public generateReport(
    allTabs: Tab[],
    filteredResult: FilteredTabs,
    closeResult: CloseApiResponse,
    rules: AutoCloseRules
  ): SummaryReport {
    return {
      timestamp: new Date().toISOString(),
      totalTabs: allTabs.length,
      filteredCount: filteredResult.eligibleForClosing.length,
      closedCount: closeResult.closedCount,
      failedCount: closeResult.closedCount - closeResult.closedCount + closeResult.failedTabIds.length,
      failedTabIds: closeResult.failedTabIds,
      skippedReasons: filteredResult.reasons,
      rulesApplied: {
        inactiveThresholdMinutes: rules.inactiveThresholdMinutes,
        minUsageFrequency: rules.minUsageFrequency,
        groupPriority: rules.groupPriority,
        savePrivateTabs: rules.savePrivateTabs,
        excludedGroups: rules.excludedGroups,
      },
    };
  }

  /**
   * 生成空摘要報告（當沒有關閉操作時）
   * @param tabs 所有分頁
   * @returns 空摘要報告
   */
  public generateEmptyReport(tabs: Tab[]): SummaryReport {
    return {
      timestamp: new Date().toISOString(),
      totalTabs: tabs.length,
      filteredCount: 0,
      closedCount: 0,
      failedCount: 0,
      failedTabIds: [],
      skippedReasons: {},
      rulesApplied: {
        inactiveThresholdMinutes: 15,
        minUsageFrequency: 1,
        groupPriority: {
          high: ['work', 'project', 'important'],
          medium: ['development', 'coding'],
          low: ['research', 'reading'],
        },
        savePrivateTabs: true,
        excludedGroups: ['pinned', 'essential'],
      },
    };
  }

  /**
   * 格式化摘要為可讀字符串
   * @param report 摘要報告
   * @returns 格式化後的字符串
   */
  public formatReport(report: SummaryReport): string {
    const lines: string[] = [];

    lines.push('=== Auto-Close Summary Report ===');
    lines.push(`Timestamp: ${report.timestamp}`);
    lines.push('');
    lines.push('--- Statistics ---');
    lines.push(`Total Tabs: ${report.totalTabs}`);
    lines.push(`Filtered for Closing: ${report.filteredCount}`);
    lines.push(`Successfully Closed: ${report.closedCount}`);
    lines.push(`Failed to Close: ${report.failedCount}`);
    lines.push('');

    if (report.failedTabIds.length > 0) {
      lines.push('--- Failed Tabs ---');
      report.failedTabIds.forEach(id => {
        lines.push(`- ${id}`);
      });
      lines.push('');
    }

    if (Object.keys(report.skippedReasons).length > 0) {
      lines.push('--- Skipped Reasons ---');
      for (const [tabId, reasons] of Object.entries(report.skippedReasons)) {
        lines.push(`${tabId}: ${reasons.join(', ')}`);
      }
      lines.push('');
    }

    lines.push('--- Rules Applied ---');
    lines.push(`Inactive Threshold: ${report.rulesApplied.inactiveThresholdMinutes} minutes`);
    lines.push(`Min Usage Frequency: ${report.rulesApplied.minUsageFrequency} per hour`);
    lines.push(`Save Private Tabs: ${report.rulesApplied.savePrivateTabs}`);
    lines.push(`Excluded Groups: ${report.rulesApplied.excludedGroups.join(', ')}`);
    lines.push('Group Priority:');
    lines.push(`  High: ${report.rulesApplied.groupPriority.high.join(', ')}`);
    lines.push(`  Medium: ${report.rulesApplied.groupPriority.medium.join(', ')}`);
    lines.push(`  Low: ${report.rulesApplied.groupPriority.low.join(', ')}`);

    return lines.join('\n');
  }

  /**
   * 創建摘要生成器實例
   * @returns SummaryGenerator 實例
   */
  public static create(): SummaryGenerator {
    return new SummaryGenerator();
  }
}

/**
 * 創建摘要生成器實例的工廠函數
 * @returns SummaryGenerator 實例
 */
export function createSummaryGenerator(): SummaryGenerator {
  return new SummaryGenerator();
}