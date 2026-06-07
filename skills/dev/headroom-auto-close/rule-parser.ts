import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'yaml';

/**
 * 自動關閉規則接口
 */
export interface AutoCloseRules {
  inactiveThresholdMinutes: number;
  minUsageFrequency: number;
  groupPriority: {
    high: string[];
    medium: string[];
    low: string[];
  };
  savePrivateTabs: boolean;
  excludedGroups: string[];
  maxTabsToClose: number;
}

/**
 * 預設規則配置
 */
export const DEFAULT_RULES: AutoCloseRules = {
  inactiveThresholdMinutes: 15,
  minUsageFrequency: 1,
  groupPriority: {
    high: ['work', 'project', 'important'],
    medium: ['development', 'coding'],
    low: ['research', 'reading'],
  },
  savePrivateTabs: true,
  excludedGroups: ['pinned', 'essential'],
  maxTabsToClose: 100,
};

/**
 * 規則解析和驗證類
 */
export class RuleParser {
  private configPath: string;

  constructor(configDir: string = 'skills/dev/headroom-auto-close') {
    this.configPath = path.join(configDir, 'auto-close-rules.md');
  }

  /**
   * 從文件解析規則
   * @returns 解析後的規則或預設規則
   */
  public parseRules(): AutoCloseRules {
    try {
      // 檢查配置文件是否存在
      if (!fs.existsSync(this.configPath)) {
        console.log('配置文件不存在，使用預設規則');
        return { ...DEFAULT_RULES };
      }

      // 讀取配置文件
      const fileContent = fs.readFileSync(this.configPath, 'utf8');
      
      // 解析 YAML 配置（從 Markdown 文件中提取 YAML 區塊）
      const yamlContent = this.extractYamlFromMarkdown(fileContent);
      
      if (!yamlContent) {
        console.log('未找到 YAML 配置，使用預設規則');
        return { ...DEFAULT_RULES };
      }

      // 解析 YAML
      const parsedRules = parse(yamlContent) as AutoCloseRules;
      
      // 驗證規則結構
      const validatedRules = this.validateRules(parsedRules);
      
      return validatedRules;
    } catch (error) {
      console.error('解析規則失敗，使用預設規則:', error);
      return { ...DEFAULT_RULES };
    }
  }

  /**
   * 從 Markdown 文件中提取 YAML 區塊
   * @param markdownContent Markdown 文件內容
   * @returns YAML 內容或 null
   */
  private extractYamlFromMarkdown(markdownContent: string): string | null {
    // 匹配 YAML front matter 或代碼塊中的 YAML
    const yamlBlockRegex = /```yaml\s*([\s\S]*?)```/;
    const match = markdownContent.match(yamlBlockRegex);
    
    if (match && match[1]) {
      return match[1].trim();
    }
    
    // 尝試查找 YAML 區塊
    const yamlRegex = /```[\s\S]*?[\r\n]([\s\S]*?)```/;
    const yamlMatch = markdownContent.match(yamlRegex);
    
    if (yamlMatch && yamlMatch[1]) {
      return yamlMatch[1].trim();
    }
    
    return null;
  }

  /**
   * 驗證規則結構
   * @param rules 待驗證的規則
   * @returns 驗證後的規則
   */
  private validateRules(rules: AutoCloseRules): AutoCloseRules {
    const validated: AutoCloseRules = {
      ...DEFAULT_RULES,
    };

    // 驗證和設置基本字段
    if (typeof rules.inactiveThresholdMinutes === 'number') {
      validated.inactiveThresholdMinutes = Math.max(1, rules.inactiveThresholdMinutes);
    }

    if (typeof rules.minUsageFrequency === 'number') {
      validated.minUsageFrequency = Math.max(1, rules.minUsageFrequency);
    }

    if (typeof rules.maxTabsToClose === 'number') {
      validated.maxTabsToClose = Math.max(1, rules.maxTabsToClose);
    }

    if (typeof rules.savePrivateTabs === 'boolean') {
      validated.savePrivateTabs = rules.savePrivateTabs;
    }

    // 驗證和設置群組優先級
    if (rules.groupPriority && typeof rules.groupPriority === 'object') {
      const priority = rules.groupPriority;
      
      if (Array.isArray(priority.high)) {
        validated.groupPriority = {
          ...validated.groupPriority,
          high: priority.high,
        };
      }
      
      if (Array.isArray(priority.medium)) {
        validated.groupPriority = {
          ...validated.groupPriority,
          medium: priority.medium,
        };
      }
      
      if (Array.isArray(priority.low)) {
        validated.groupPriority = {
          ...validated.groupPriority,
          low: priority.low,
        };
      }
    }

    // 驗證和設置排除群組
    if (Array.isArray(rules.excludedGroups)) {
      validated.excludedGroups = rules.excludedGroups;
    }

    return validated;
  }
}

/**
 * 創建規則解析器實例
 * @param configDir 配置目錄路徑
 * @returns RuleParser 實例
 */
export function createRuleParser(configDir?: string): RuleParser {
  return new RuleParser(configDir);
}