# 自動關閉規則配置 (Auto-Close Rules Configuration)

## 配置文件 (Configuration File)

此文件包含自動關閉分頁功能的配置參數。所有參數都是可選的，如果缺失，將使用預設值。

## 規則配置 (Rules Configuration)

```yaml
# 自動關閉分頁的時間閾值（分鐘）
# 如果分頁在最後訪問後超過此時間未被使用，將被關閉
inactiveThresholdMinutes: 15

# 分頁最小使用頻率（每小時）
# 低於此頻率的分頁可能被視為不活躍
minUsageFrequency: 1

# 群組優先級設定
# 指定哪些群組具有高、中、低優先級
groupPriority:
  # 高優先級群組 - 不會被關閉
  high: ["work", "project", "important"]
  # 中優先級群組 - 較少被關閉
  medium: ["development", "coding"]
  # 低優先級群組 - 更容易被關閉
  low: ["research", "reading"]

# 是否保存私密分頁
# 如果為 true，標題包含 "private" 或 "secret" 的分頁將不會被關閉
savePrivateTabs: true

# 排除的群組
# 這些群組的分頁永遠不會被關閉，即使它們符合其他條件
excludedGroups: ["pinned", "essential"]

# 一次關閉的最大分頁數
# 防止一次操作關閉過多分頁
maxTabsToClose: 100
```

## 規則說明 (Rule Descriptions)

### inactiveThresholdMinutes

**類型:** `number`  
**默認值:** `15`  
**範圍:** `>= 1`

分頁在最後訪問時間超過此閾值後將被視為不活躍並關閉。

**示例:**
- 設置為 `15`：15 分鐘未使用的分頁將被關閉
- 設置為 `30`：30 分鐘未使用的分頁將被關閉

### minUsageFrequency

**類型:** `number`  
**默認值:** `1`  
**範圍:** `>= 1`

分頁每小時的最小訪問次數。低於此頻率的分頁可能被關閉。

**示例:**
- 設置為 `1`：每小時使用次數少於 1 次的分頁可能被關閉
- 設置為 `2`：每小時使用次數少於 2 次的分頁可能被關閉

### groupPriority

**類型:** `object`  
**結構:**
```yaml
groupPriority:
  high: string[]  # 高優先級群組名稱列表
  medium: string[] # 中優先級群組名稱列表
  low: string[]    # 低優先級群組名稱列表
```

**默認值:**
```yaml
groupPriority:
  high: ["work", "project", "important"]
  medium: ["development", "coding"]
  low: ["research", "reading"]
```

群組優先級決定哪些群組的分頁更應該保留：

- **high**: work, project, important - 最高優先級，不會被關閉
- **medium**: development, coding - 中等優先級，較少被關閉
- **low**: research, reading - 低優先級，更容易被關閉

### savePrivateTabs

**類型:** `boolean`  
**默認值:** `true`

如果設置為 `true`，標題包含 "private" 或 "secret" 關鍵字的分頁將不會被關閉（不區分大小寫）。

### excludedGroups

**類型:** `string[]`  
**默認值:** `["pinned", "essential"]`

這些群組的分頁永遠不會被關閉，即使它們符合其他條件。

### maxTabsToClose

**類型:** `number`  
**默認值:** `100`  
**範圍:** `>= 1`

一次自動關閉操作的最大分頁數，防止過度關閉。

**示例:**
- 設置為 `100`：最多關閉 100 個分頁
- 設置為 `50`：最多關閉 50 個分頁

## 配置示例 (Configuration Examples)

### 激進的關閉策略
```yaml
inactiveThresholdMinutes: 5
minUsageFrequency: 2
savePrivateTabs: true
excludedGroups: ["pinned"]
maxTabsToClose: 50
```

### 寬鬆的關閉策略
```yaml
inactiveThresholdMinutes: 60
minUsageFrequency: 0
savePrivateTabs: true
excludedGroups: ["pinned", "essential", "work"]
maxTabsToClose: 200
```

### 僅限工作群組
```yaml
inactiveThresholdMinutes: 15
minUsageFrequency: 1
groupPriority:
  high: ["work", "project"]
  medium: []
  low: []
savePrivateTabs: true
excludedGroups: ["pinned"]
maxTabsToClose: 100
```