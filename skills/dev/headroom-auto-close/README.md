# Headroom Auto-Close Skill

自動關閉瀏覽器分頁的功能模塊。

## 功能特性

- ✅ **規則解析**: 從配置文件解析自動關閉規則
- ✅ **分頁過濾**: 根據不活躍時間、使用頻率和群組優先級過濾分頁
- ✅ **私密分頁排除**: 檢測並排除包含"private"或"secret"關鍵字的分頁
- ✅ **鎖定機制**: 防止並發執行的獨佔鎖定機制
- ✅ **關閉執行**: 調用 Headroom API 關閉指定分頁
- ✅ **摘要報告**: 生成全面的關閉操作摘要報告

## 目錄結構

```
skills/dev/headroom-auto-close/
├── auto-close-rules.md     # 規則配置文件
├── SKILL.md                # Skill 定義文件
├── README.md               # 本文檔
├── index.ts                # 主模塊入口
├── rule-parser.ts          # 規則解析和驗證
├── tab-filter.ts           # 分頁過濾邏輯
├── private-tab-filter.ts   # 私密分頁排除
├── lock-manager.ts         # 鎖定機制
├── close-executor.ts       # 關閉執行器
├── summary-generator.ts    # 摘要報告生成器
├── types.ts                # TypeScript 類型定義
└── tsconfig.json           # TypeScript 配置
```

## 安裝依賴

```bash
npm install yaml
```

## 使用方法

### 基本使用

```typescript
import { autoCloseTabs, createAutoCloseExecutor } from './index';
import { Tab } from './types';

// 創建分頁列表
const tabs: Tab[] = [
  {
    id: '1',
    title: 'Tab 1',
    url: 'https://example.com',
    groupId: 'work',
    groupName: 'Work',
    lastAccessed: new Date(Date.now() - 20 * 60 * 1000).toISOString(), // 20 minutes ago
    active: false,
  },
  // more tabs...
];

// 執行自動關閉
const result = await autoCloseTabs(tabs);

console.log(result.summary);
```

### 使用執行器

```typescript
import { createAutoCloseExecutor } from './index';

const executor = createAutoCloseExecutor();
const result = await executor.closeTabs(tabs);
```

### 自定義規則

```typescript
import { createRuleParser } from './rule-parser';

const ruleParser = createRuleParser('custom/path');
const rules = ruleParser.parseRules();

console.log(rules.inactiveThresholdMinutes); // 15 (default)
```

### 鎖定機制

```typescript
import { createLockManager } from './lock-manager';

const lockManager = createLockManager();
const acquired = lockManager.acquireLock();

if (acquired) {
  try {
    // 執行操作
  } finally {
    lockManager.releaseLock();
  }
}
```

## 規則配置

### auto-close-rules.md

```yaml
inactiveThresholdMinutes: 15
minUsageFrequency: 1
groupPriority:
  high: ["work", "project", "important"]
  medium: ["development", "coding"]
  low: ["research", "reading"]
savePrivateTabs: true
excludedGroups: ["pinned", "essential"]
maxTabsToClose: 100
```

### 配置選項

| 選項 | 類型 | 默認值 | 說明 |
|------|------|--------|------|
| `inactiveThresholdMinutes` | `number` | `15` | 分頁不活躍多久後關閉（分鐘） |
| `minUsageFrequency` | `number` | `1` | 分頁最小使用頻率（每小時） |
| `groupPriority.high` | `string[]` | `["work", "project", "important"]` | 高優先級群組 |
| `groupPriority.medium` | `string[]` | `["development", "coding"]` | 中優先級群組 |
| `groupPriority.low` | `string[]` | `["research", "reading"]` | 低優先級群組 |
| `savePrivateTabs` | `boolean` | `true` | 是否保存私密分頁 |
| `excludedGroups` | `string[]` | `["pinned", "essential"]` | 排除的群組 |
| `maxTabsToClose` | `number` | `100` | 一次關閉的最大分頁數 |

## API 參考

### RuleParser

- `parseRules(): AutoCloseRules` - 從文件解析規則
- `createRuleParser(configDir?: string): RuleParser` - 創建規則解析器實例

### TabFilter

- `filterTabs(tabs: Tab[]): FilteredTabs` - 過濾分頁
- `shouldPreserveTab(tab: Tab): { shouldPreserve: boolean; reason: string }` - 檢查是否保留分頁
- `createTabFilter(rules: AutoCloseRules): TabFilter` - 創建分頁過濾器實例

### PrivateTabFilter

- `filterPrivateTabs(tabs: Tab[]): Tab[]` - 獲取私密分頁
- `excludePrivateTabs(tabs: Tab[]): Tab[]` - 排除私密分頁
- `isPrivateTab(tab: Tab): boolean` - 檢查是否為私密分頁
- `createPrivateTabFilter(options?: Partial<PrivateTabFilterOptions>): PrivateTabFilter` - 創建私密分頁過濾器實例

### LockManager

- `acquireLock(): boolean` - 獲取鎖
- `releaseLock(): boolean` - 釋放鎖
- `hasLock(): boolean` - 檢查是否存在鎖
- `isLockExpired(): boolean` - 檢查鎖是否過期
- `executeWithLock<T>(operation: () => Promise<T>): Promise<T \| null>` - 執行帶鎖操作
- `createLockManager(options?: Partial<LockManagerOptions>): LockManager` - 創建鎖管理器實例

### CloseExecutor

- `closeTabs(tabs: Tab[]): Promise<CloseResult>` - 關閉分頁
- `createCloseExecutor(options?: CloseExecutorOptions): CloseExecutor` - 創建關閉執行器實例

### SummaryGenerator

- `generateReport(...): SummaryReport` - 生成報告
- `generateEmptyReport(...): SummaryReport` - 生成空報告
- `formatReport(...): string` - 格式化報告
- `createSummaryGenerator(): SummaryGenerator` - 創建摘要生成器實例

## 類型定義

### Tab

```typescript
interface Tab {
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
```

### AutoCloseRules

```typescript
interface AutoCloseRules {
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
```

### CloseResult

```typescript
interface CloseResult {
  success: boolean;
  closedCount: number;
  failedCount: number;
  failedTabIds: string[];
  summary: SummaryReport;
}
```

### SummaryReport

```typescript
interface SummaryReport {
  timestamp: string;
  totalTabs: number;
  filteredCount: number;
  closedCount: number;
  failedCount: number;
  failedTabIds: string[];
  skippedReasons: Record<string, string[]>;
  rulesApplied: AutoCloseRules;
}
```

## 開發

### 編譯 TypeScript

```bash
npx tsc
```

### 檢查 TypeScript

```bash
npx tsc --noEmit
```

### 測試

```bash
npm test
```

## 貢獻

歡迎提交 Issue 和 Pull Request！

## 許可證

MIT