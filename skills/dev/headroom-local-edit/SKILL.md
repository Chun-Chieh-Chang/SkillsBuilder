---
name: "headroom-local-edit"
description: "本地標籤管理（離線模式）"
trigger_keywords:
  - "headroom local edit"
  - "本地標籤編輯"
  - "離線標籤管理"
prerequisites:
  - "headroom-sync（需要 local cache）"
  - "Node.js >= 18.x"
  - "Git 版本控制系統"
---

# headroom-local-edit Skill

本地標籤管理（離線模式）的技能模組，提供在無網路連線情況下編輯 Headroom 標籤的能力。

## 功能概述

此技能模組負責：
- 本地標籤內容編輯（更新標題/群組）
- 標籤刪除操作
- 差異補丁（patch）檔案生成
- 自動同步至 Headroom（關閉時）

## 目錄結構

```
skills/dev/headroom-local-edit/
├── .config.json           # 本 skill 的設定配置
├── SKILL.md               # 本文件
└── tasks.md               # 任務清單（由 spec 系統管理）
```

## 使用方式

### 觸發關鍵詞
- `headroom local edit` - 啟動本地編輯流程
- `本地標籤編輯` - 中文觸發本地編輯
- `離線標籤管理` - 無網路時的標籤管理

### 前置需求
- 確保 headroom-sync 已執行過（建立 local cache）
- 確保 Node.js 版本 >= 18.x
- 確保 Git 版本控制系統已初始化

## 核心功能

### 1. 更新 Tab 標題/群組
- 修改本地快取中的標籤資料
- 支援標題與群組欄位更新
- 更新後生成相應的 patch 記錄

### 2. 刪除 Tab
- 從本地快取中標記刪除
- 保留歷史記錄供後續審查
- 生成對應的刪除 patch

### 3. Patch 檔案生成
- 產生 JSON Patch (RFC 6902) 格式差異
- 支援批量操作合併
- 根據 `.config.json` 設定限制歷史 patch 數量

### 4. Auto-sync on Close
- 根據 `autoSyncOnClose` 設定自動同步
- 關閉編輯會話時觸發
- 使用 Git 追蹤變更並同步至 Headroom

## 設定選項

在 `.config.json` 中可調整：

```json
{
  "autoSyncOnClose": true,
  "patchEnabled": true,
  "patchHistoryLimit": 10
}
```

- **autoSyncOnClose**: 關閉編輯時是否自動同步至 Headroom
- **patchEnabled**: 是否啟用 patch 檔案生成
- **patchHistoryLimit**: 保留的 patch 歷史記錄數量上限
