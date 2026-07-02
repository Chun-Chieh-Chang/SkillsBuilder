---
name: understand-anything
description: 利用 Understand-Anything 語意代碼圖譜解析目前專案，生成交互式 Dashboard 與進行變更影響範圍分析（Ripple Effect Analysis）。
---

# Understand-Anything 整合技能

本技能賦予 AI 助理調用代碼圖譜與視覺化儀表板的能力，讓開發者在接手複雜專案時能快速理清脈絡。

## 觸發短語 (Trigger Phrases)
- "啟動 Understand-Anything", "開啟代碼圖譜", "生成架構圖", "影響範圍分析", "Ripple Effect Analysis", "/understand"

## 1. 探索階段 (Discovery Phase)
在對專案架構進行深度重構或分析前，應先更新並載入圖譜：
```bash
# 增量掃描專案並生成圖譜（會自動識別開發者使用的對話語言）
/understand

# 強制生成繁體中文圖譜
/understand --language zh-TW
```

## 2. 執行與交互階段 (Execution & Interaction)
- **開啟視覺化儀表板**：
  ```bash
  /understand-dashboard
  ```
- **查詢特定業務流或架構**：
  ```bash
  /understand-chat "這專案的 API 請求與狀態管理是如何串接的？"
  ```
- **深入解析特定代碼檔案**：
  ```bash
  /understand-explain src/auth/login.ts
  ```

## 3. 變更驗證階段 (Impact Analysis)
在修改通用模組（如 common utils, API configs）後，執行影響分析，評估修改的「爆炸半徑」：
```bash
/understand-diff
```

## 4. 知識歸檔 (Archive to Wiki)
結合 SkillsBuilder 的 `wiki/` 機制，使用圖譜生成的資訊更新專案的 `wiki/` 結構。
可以使用本專案的 `python tools/understand_bridge.py` 工具自動同步圖譜至專案文檔。
