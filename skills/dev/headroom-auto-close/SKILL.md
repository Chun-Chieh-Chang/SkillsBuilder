---
name: headroom-auto-close
type: dev
trigger: auto-close
description: 自動關閉瀏覽器分頁的功能，包含規則解析、分頁過濾、私密分頁排除、鎖定機制和關閉執行
---

# Headroom Auto-Close Skill

## 概述

`headroom-auto-close` 技能提供自動關閉瀏覽器分頁的功能。當檢測到分頁符合預設的不活躍規則時，系統會自動關閉它們以保持瀏覽器整潔。

## 功能

- **規則解析**: 從配置文件解析自動關閉規則，支援 YAML/JSON 格式
- **分頁過濾**: 根據不活躍時間、使用頻率和群組優先級過濾分頁
- **私密分頁排除**: 檢測並排除包含"private"或"secret"關鍵字的分頁
- **鎖定機制**: 防止並發執行的獨佔鎖定機制
- **關閉執行**: 調用 Headroom API 關閉指定分頁

## 配置

### auto-close-rules.md

自動關閉規則配置文件，包含以下參數：

- `inactiveThresholdMinutes`: 分頁不活躍多久後關閉（分鐘）
- `minUsageFrequency`: 分頁最小使用頻率（每小時）
- `groupPriority`: 群組優先級設定
- `savePrivateTabs`: 是否保存私密分頁
- `excludedGroups`: 排除的群組列表
- `maxTabsToClose`: 一次關閉的最大分頁數

## 使用範例

```
執行自動關閉程序
- 讀取 auto-close-rules.md 配置
- 過濾符合條件的分頁
- 建立獨佔鎖定
- 關閉分頁並生成報告
```

## 依賴

- `headroom-api`: 用於調用 `/tabs/close` 端點
- `fs`: 用於文件操作和鎖定機制