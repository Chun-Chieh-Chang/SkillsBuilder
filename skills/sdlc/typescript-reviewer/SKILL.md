---
name: typescript-reviewer
description: 專業的 TypeScript 專家審查代理，結合類型安全檢查、編譯器指令分析與 ESLint 靜態分析。
---

# TypeScript Reviewer (TypeScript 專家審查)

此技能用於對 TypeScript 專案進行系統化、專業級的代碼審查。它結合了 TypeScript 編譯器 (`tsc`) 的類型安全檢查與 ESLint 的代碼風格與潛在錯誤分析，輸出結構化審查報告。

## 审查流程 (The Review Workflow)

### Phase 1: 環境檢測 (Environment Detection)
**核心：優先使用可用的硬體分析工具，降級至語義分析。**
- **檢查 `tsc` 可用性**：
  - 嘗試執行 `tsc --noEmit` 或 `npx tsc --noEmit`。
  - 若成功，提取所有類型錯誤與警告。
- **檢查 `eslint` 可用性**：
  - 嘗試執行 `eslint .` 或 `npx eslint .`。
  - 若成功，提取所有 linting 問題。
- **降級至語義審查**：
  - 若兩者皆不可用，啟動「語義審查模式」，基於代碼結構與最佳實踐進行靜態分析。

### Phase 2: 類型安全分析 (Type Safety Analysis)
**核心：檢查 TypeScript 類型系統的正確性與完整性。**
- **類型推斷過度依賴**：
  - 檢查是否濫用 `any` 或 `unknown`。
  - 建議使用精確的自定義類型 (`interface` / `type`)。
- **可選鏈與空值合併**：
  - 檢查是否正確使用 `?.` 與 `??` 運算子。
  - 確保未處理的 `null` / `undefined` 不會導致運行時錯誤。
- **泛型使用**：
  - 檢查泛型是否過度複雜或類型參數遺漏。
  - 確保泛型參數有明確的邊界 (`extends`)。

### Phase 3: 編譯器指令分析 (Compiler Options Analysis)
**核心：驗證 `tsconfig.json` 的配置是否符合安全與可維護性標準。**
- **strict 模式**：
  - 確保 `strict: true` 或等價的 `noImplicitAny` / `strictNullChecks` / `noUnusedLocals` 等已啟用。
- **noImplicitReturns**：
  - 檢查函數是否所有分支都有明確返回值。
- **noFallthroughCasesInSwitch**：
  - 確保 `switch` 語句的 `case` 有明確的 `break` / `return`。

### Phase 4: 代碼風格與潛在錯誤 (Code Style & Anti-Patterns)
**核心：檢查潛在的運行時錯誤與風格問題。**
- **未使用變數與函數**：
  - 檢查 `noUnusedLocals` / `noUnusedParameters` 啟用後的警告。
- **同步 vs. 異步**：
  - 檢查是否錯誤地將同步函數標記為 `async`。
  - 確保 `await` 僅在 `async` 函數中使用。
- **導入路徑**：
  - 檢查是否使用絕對路徑 (`/src/...`) 或相對路徑 (`./...`) 保持一致性。
  - 確保未導入不存在的模組。

## 輸出格式 (Structured Review Report)

審查報告必須分為以下 4 個區塊：

### 1. 概述 (Summary)
- **總問題數**：類型錯誤 + ESLint 警告 + 潛在錯誤。
- **嚴重等級**：Critical / High / Medium / Low。
- **建議行動**：立即修復 / 下次迭代 / 建議重構。

### 2. 類型安全問題 (Type Safety Issues)
- **類型錯誤**：`tsc` 報告的類型不匹配問題。
- **類型推斷濫用**：過度依賴 `any` / `unknown`。
- **空值處理缺失**：未處理 `null` / `undefined`。

### 3. 編譯器配置問題 (Compiler Configuration Issues)
- **tsconfig.json 缺陷**：`strict` 模式未啟用、`noImplicitReturns` 缺失等。
- **最佳實踐違規**：`noFallthroughCasesInSwitch` 未啟用。

### 4. 代碼風格與潛在錯誤 (Code Style & Anti-Patterns)
- **未使用變數**：`noUnusedLocals` / `noUnusedParameters` 警告。
- **異步誤用**：`async` / `await` 錯誤使用。
- **導入路徑問題**：路徑不一致、指向不存在模組。

## ⚠️ 絕對禁忌
- **禁止盲目修復**：任何建議修復前，必須先解释問題根因。
- **禁止忽略類型錯誤**：`tsc` 錯誤視為 Critical，必須優先處理。
- **禁止修改 `tsconfig.json` 未經確認**：配置變更必須與用戶討論。

## 📊 工具可用性检测 (Tool Availability Detection)

| 工具 | 檢測命令 | 降級策略 |
|------|----------|----------|
| `tsc` | `tsc --version` | 啟用語義分析模式 |
| `eslint` | `eslint --version` | 啟用語義分析模式 |

## 🔗 相關技能
- `bug-diagnose`：處理審查發現的具體錯誤。
- `tdd-enforcer`：確保審查通過後的代碼符合測試要求。
- `verification-before-completion`：確保審查報告在完工前完成。
