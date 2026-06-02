---
name: knowledge-bridge
description: 知識橋樑。自動化處理從 NotebookLM 或外部匯出的 Markdown 知識，將其精煉並同步至專案 Wiki 與開發上下文。
---

# Knowledge Bridge (知識橋樑)

此技能旨在消除外部研究與本地開發之間的斷層。它能將 NotebookLM 的「研究成果」自動化為專案的「技術資產」。

## 啟動準備 (The Bridge Setup)
1. 將 NotebookLM 匯出的 Markdown 檔案放入專案的 `raw/` 目錄。
2. 建議命名格式：`raw/notebook_export_[日期].md`。

## 執行流程 (The Sync Pipeline)

### Phase 1: Ingest & Parse (吸收與解析)
- **動作**：掃描 `raw/` 目錄下最新的 Markdown 檔案。
- **目標**：識別內容中的「核心實體 (Entities)」、「技術規範 (Conventions)」與「邏輯約束 (Constraints)」。

### Phase 2: Refine & Categorize (精煉與分類)
- **動作**：
    - 將技術細節提取至 `wiki/entities/`。
    - 將開發準則提取至 `wiki/concepts/`。
    - 將專案背景更新至 `README.md` 或 `wiki/index.md`。

### Phase 3: Sync & Evolution (同步與進化)
- **動作**：
    - 更新 `DEV_LOG.md` 紀錄知識導入。
    - 如果內容包含新的代碼模式，自動提議更新 `GEMINI.md`。

## 指令模式 (Magic Phrases)
- 「啟動知識橋樑，同步 `raw/` 下的資料」
- 「Sync knowledge from NotebookLM」
- 「將匯出的研究轉化為開發資產」

## 自動化原則
- **MECE 分類**：確保導入的知識不與現有 Wiki 內容衝突，應使用 `replace` 進行增量更新而非盲目覆蓋。
- **高信號提取**：過濾掉冗餘的解釋，僅保留對開發有直接指導意義的「信號」。
