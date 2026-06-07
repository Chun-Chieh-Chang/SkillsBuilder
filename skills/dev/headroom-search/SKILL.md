---
name: "headroom-search"
description: "搜尋與過濾 Headroom 瀏覽器標籤"
trigger_keywords:
  - "headroom search"
  - "搜尋 browser 标签"
  - "headroom filter"
  - "headroom 篩選"
prerequisites:
  - "headroom-sync（需要 local cache）"
---

# headroom-search Skill

搜尋與過濾 Headroom 瀏覽器標籤的技能模組。

## 功能概述

此技能模組負責：
- 從本地快取搜尋 Headroom 標籤資料
- 提供多維度過濾功能
- 支援組合搜尋與分頁

## 目錄結構

```
skills/dev/headroom-search/
├── .data/
│   └── cache/             # 快取資料目錄（由 headroom-sync 提供）
├── SKILL.md               # 本文件
└── tasks.md               # 任務清單（由 spec 系統管理）
```

## 使用方式

### 觸發關鍵詞
- `headroom search` - 啟動搜尋流程
- `搜尋 browser 标签` - 中文觸發搜尋
- `headroom filter` - 使用過濾功能
- `headroom 篩選` - 中文觸發篩選

### 前置需求
- 確保已執行 headroom-sync 並建立 local cache
- 確保 .data/cache/tabs.json 存在

## 搜尋與過濾功能

### 1. 關鍵字搜尋 (Keyword Search)
支援在以下欄位中搜尋關鍵字：
- **title**: 標籤標題
- **URL**: 標籤網址

### 2. 群組過濾 (Group Filtering)
按標籤群組進行過濾：
- 指定群組名稱
- 多群組選取

### 3. 狀態過濾 (State Filtering)
過濾標籤狀態：
- `active`: 活躍標籤
- `inactive`: 非活躍標籤

### 4. 組合搜尋 (Combined AND Search)
支援多條件組合搜尋：
- 關鍵字 + 群組
- 關鍵字 + 狀態
- 群組 + 狀態
- 關鍵字 + 群組 + 狀態

### 5. 分頁支援 (Pagination Support)
- 支援 `page` 參數指定頁碼
- 支援 `pageSize` 參數指定每頁筆數
- 回傳總筆數與總頁數

## 資料格式

### 請求參數
```
{
  "query": "search keyword",
  "group": "group name",
  "state": "active|inactive",
  "page": 1,
  "pageSize": 20
}
```

### 回應格式
```
{
  "results": [
    {
      "id": "string",
      "title": "string",
      "url": "string",
      "group": "string",
      "state": "active|inactive",
      "timestamp": "ISO8601"
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "pageSize": 20,
    "totalPages": 5
  }
}
```

## 整合說明

此技能模組依賴 headroom-sync 提供的本地快取資料：
- 快取路徑: `.data/cache/tabs.json`
- 同步流程: 先執行 headroom-sync，再使用 headroom-search