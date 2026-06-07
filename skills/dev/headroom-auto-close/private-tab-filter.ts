import { Tab } from './types';

/**
 * 私密分頁過濾器選項
 */
export interface PrivateTabFilterOptions {
  savePrivateTabs: boolean;
  privateKeywords: string[];
}

/**
 * 預設選項
 */
export const DEFAULT_PRIVATE_FILTER_OPTIONS: PrivateTabFilterOptions = {
  savePrivateTabs: true,
  privateKeywords: ['private', 'secret'],
};

/**
 * 私密分頁過濾器類
 */
export class PrivateTabFilter {
  private options: PrivateTabFilterOptions;

  constructor(options: Partial<PrivateTabFilterOptions> = {}) {
    this.options = {
      ...DEFAULT_PRIVATE_FILTER_OPTIONS,
      ...options,
    };
  }

  /**
   * 從分頁列表中過濾出私密分頁
   * @param tabs 所有分頁
   * @returns 私密分頁列表
   */
  public filterPrivateTabs(tabs: Tab[]): Tab[] {
    return tabs.filter(tab => this.isPrivateTab(tab));
  }

  /**
   * 從分頁列表中排除私密分頁
   * @param tabs 所有分頁
   * @returns 排除私密分頁後的列表
   */
  public excludePrivateTabs(tabs: Tab[]): Tab[] {
    return tabs.filter(tab => !this.isPrivateTab(tab));
  }

  /**
   * 檢查分頁是否為私密分頁
   * @param tab 分頁
   * @returns 是否為私密分頁
   */
  public isPrivateTab(tab: Tab): boolean {
    // 如果不保存私密分頁，返回 false
    if (!this.options.savePrivateTabs) {
      return false;
    }

    // 檢查分頁標題是否包含私密關鍵字
    const titleLower = tab.title.toLowerCase();
    const urlLower = tab.url.toLowerCase();
    
    for (const keyword of this.options.privateKeywords) {
      const keywordLower = keyword.toLowerCase();
      
      // 檢查標題
      if (titleLower.includes(keywordLower)) {
        return true;
      }
      
      // 檢查 URL
      if (urlLower.includes(keywordLower)) {
        return true;
      }
    }

    // 檢查群組名稱
    const groupNameLower = tab.groupName.toLowerCase();
    for (const keyword of this.options.privateKeywords) {
      const keywordLower = keyword.toLowerCase();
      if (groupNameLower.includes(keywordLower)) {
        return true;
      }
    }

    return false;
  }

  /**
   * 檢查字符串是否包含私密關鍵字
   * @param text 要檢查的字符串
   * @returns 是否包含私密關鍵字
   */
  public containsPrivateKeyword(text: string): boolean {
    if (!this.options.savePrivateTabs) {
      return false;
    }

    const textLower = text.toLowerCase();
    
    for (const keyword of this.options.privateKeywords) {
      const keywordLower = keyword.toLowerCase();
      if (textLower.includes(keywordLower)) {
        return true;
      }
    }

    return false;
  }

  /**
   * 獲取過濾選項
   * @returns 過濾選項
   */
  public getFilterOptions(): PrivateTabFilterOptions {
    return this.options;
  }

  /**
   * 創建私密分頁過濾器實例
   * @param options 過濾選項
   * @returns PrivateTabFilter 實例
   */
  public static create(options?: Partial<PrivateTabFilterOptions>): PrivateTabFilter {
    return new PrivateTabFilter(options);
  }
}

/**
 * 創建私密分頁過濾器實例的工廠函數
 * @param options 過濾選項
 * @returns PrivateTabFilter 實例
 */
export function createPrivateTabFilter(options?: Partial<PrivateTabFilterOptions>): PrivateTabFilter {
  return new PrivateTabFilter(options);
}