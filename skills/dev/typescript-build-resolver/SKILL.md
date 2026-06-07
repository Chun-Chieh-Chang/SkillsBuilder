---
name: typescript-build-resolver
description: 專業的 TypeScript 編譯問題診斷與修復代理，自動解析編譯錯誤與套件版本衝突。
---

# TypeScript Build Resolver (TypeScript 編譯問題診斷)

此技能用於自動診斷與修復 TypeScript 專案的編譯錯誤與依賴問題。它結合 `tsc` 編譯器輸出的錯誤訊息與 `npm`/`yarn` 的套件版本分析，輸出結構化診斷報告。

## 診斷流程 (The Diagnosis Workflow)

### Phase 1: 環境檢測 (Environment Detection)
- **檢查 `tsc` 可用性**：
  - 嘗試執行 `tsc --noEmit`。
  - 若失敗，提取錯誤訊息。
- **檢查 `npm`/`yarn` 可用性**：
  - 嘗試執行 `npm list` 或 `yarn list`。
  - 若成功，提取套件版本資訊。

### Phase 2: 編譯錯誤解析 (Compilation Error Parsing)
- **類型錯誤**：
  - 檢查 `tsc` 的類型不匹配錯誤。
  - 提取檔案路徑、行號、錯誤代碼。
- **語法錯誤**：
  - 檢查 `tsc` 的語法錯誤（缺少分號、括號等）。
- **模組解析錯誤**：
  - 檢查 `Cannot find module` 錯誤。
  - 判斷是 `import` 路徑錯誤還是模組未安裝。

### Phase 3: 套件版本衝突檢測 (Package Version Conflict Detection)
- **檢查 `package.json` 與 `package-lock.json`**：
  - 檢查是否有不一致的版本。
- **檢查依賴樹衝突**：
  - 使用 `npm ls <package>` 或 `yarn why <package>`。
  - 檢查是否存在多個版本的同一套件。
- **常見衝突模式**：
  - `react` + `react-dom` 版本不匹配。
  - `@types/*` 與實際套件版本不匹配。

### Phase 4: 修復建議 (Fix Suggestions)
- **類型錯誤修復**：
  - 建議修正類型提示或調整代碼邏輯。
- **模組解析錯誤修復**：
  - 建議安裝缺失的套件 (`npm install <package>`)。
- **版本衝突修復**：
  - 建議 `npm install <package>@<version>` 或使用 `overrides`。

## 輸出格式 (3-Section Response)

診斷報告必須分為以下 3 個區塊：

### 1. 診斷 (Diagnosis)
- **錯誤類型**：類型錯誤 / 語法錯誤 / 模組解析錯誤 / 版本衝突。
- **錯誤位置**：檔案路徑 + 行號（如 `src/index.ts:15:3`）。
- **根本原因**：簡單說明問題根因（如 `類型不匹配`、`缺少套件`、`版本衝突`）。

### 2. 修復 (Fix)
- **具體步驟**：
  - 類型錯誤：提供修正後的代碼片段。
  - 模組錯誤：提供 `npm install` 命令。
  - 版本衝突：提供 `npm install <package>@<version>` 命令。

### 3. 預防 (Prevention)
- **檢查清單**：
  - 啟用 `strict: true`。
  - 使用 `package-lock.json`。
  - 使用 `npm ci` 而非 `npm install`。

## ⚠️ 絕對禁忌
- **禁止盲目修復**：任何修復前，必須先分析錯誤訊息。
- **禁止修改 `package.json` 未經確認**：版本變更必須與用戶討論。
- **禁止忽略編譯錯誤**：`tsc` 錯誤視為 Critical，必須優先處理。

## 📊 工具可用性检测 (Tool Availability Detection)

| 工具 | 檢測命令 | 降級策略 |
|------|----------|----------|
| `tsc` | `tsc --version` | 啟用語義分析模式 |
| `npm`/`yarn` | `npm --version` / `yarn --version` | 手動版本分析 |

## 🔗 相關技能
- `typescript-reviewer`：事前審查，預防編譯錯誤。
- `bug-diagnose`：處理診斷發現的具體錯誤。
- `verification-before-completion`：確保修復後編譯通過。
