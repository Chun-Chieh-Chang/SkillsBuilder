---
name: "headroom-config"
description: "Headroom 整合配置管理"
triggerKeywords:
  - "headroom config"
  - "headroom configuration"
  - "headroom settings"
  - "headroom setup"
  - "headroom config management"
prerequisites: "N/A (configuration management only)"
---

# Headroom Config Skill

Headroom 整合配置管理技能，提供 Headroom API 與本地同步設定的集中化管理。

## 功能說明

### API Key Validation
- 驗證 Headroom API Key 是否有效
- 檢查 API 連線狀態
- 提供 Key 設置指導

### Cloud Sync Toggle
- 啟用/停用雲端同步
- 同步狀態監控
- 同步失敗處理

### Sync Interval Configuration
- 設定自動同步間隔（秒）
- 支援 60-3600 秒範圍
- 動態套用變更

### Auto-Close Rules Override
- 自定義標籤關閉規則
- 支援以下參數：
  - inactiveThreshold: 不活躍門檻（秒）
  - frequencyThreshold: 使用頻率門檻
  - priorityGroups: 關鍵分組列表
  - excludePinnedTabs: 排除固定標籤

## 配置文件

- `config.json` - 全域 Headroom 整合配置
- 路徑: `skills/dev/headroom-config/config.json`

## 使用範例

```
"設定 Headroom API key"
"啟用雲端同步功能"
"調整同步間隔為 10 分鐘"
"設定自動關閉不活躍標籤規則"
```

## 與其他 Skill 的整合

- `headroom-sync` - 依賴 config.json 的雲端同步設定
- `headroom-local-edit` - 使用 config.json 的本地編輯配置
- `headroom-auto-close` - 繼承 autoCloseRules 規則