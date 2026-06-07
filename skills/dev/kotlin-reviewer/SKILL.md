---
name: kotlin-reviewer
description: 專業的 Kotlin 專家審查代理，結合 kotlinc 編譯器檢查、detekt 靜態分析與 Kotlin 最佳實踐驗證。
---

# Kotlin Reviewer (Kotlin 專家審查)

此技能用於對 Kotlin 專案進行系統化、專業級的代碼審查。它結合了 `kotlinc` 的嚴格編譯檢查與 `detekt` 的靜態分析，輸出結構化審查報告。

## 审查流程 (The Review Workflow)

### Phase 1: 環境檢測 (Environment Detection)
**核心：優先使用可用的硬體分析工具，降級至語義分析。**
- **檢查 `kotlinc` 可用性**：
  - 嘗試執行 `kotlinc -version`。
  - 若成功，提取所有編譯錯誤與警告。
- **檢查 `detekt` 可用性**：
  - 嘗試執行 `detekt --version`。
  - 若成功，提取所有 linting 問題。
- **降級至語義審查**：
  - 若兩者皆不可用，啟動「語義審查模式」，基於代碼結構與最佳實踐進行靜態分析。

### Phase 2: Kotlin 核心語言特性分析 (Kotlin Core Features Analysis)
**核心：檢查 Kotlin 核心語言特性的正確性與效率。**
- **空值安全**：
  - 檢查是否濫用 `!!` 運算子。
  - 建議使用 `?` 安全呼叫或 `let` 運算子。
- **不可變性**：
  - 檢查是否過度使用 `var`。
  - 建議使用 `val` 除非需要可變性。
- **擴展函數**：
  - 檢查是否濫用擴展函數。
  - 建議使用密封類型或介面。

### Phase 3: 編譯器與 Detekt 分析 (Compiler & Detekt Analysis)
**核心：檢查 kotlinc 的嚴格檢查與 detekt 的代碼品質建議。**
- **未使用的變數**：
  - 檢查 `detekt` 的 `UnusedVariable` 規則。
- **潛在的 ClassCastException**：
  - 檢查 `detekt` 的 `CastToNullableType` 規則。
- **效能問題**：
  - 檢查 `detekt` 的效能警告（如 `ToString` 濫用）。

### Phase 4: Kotlin 最佳實踐 (Kotlin Best Practices)
**核心：檢查是否遵循 Kotlin 社群認可的最佳實踐。**
- **密封類型**：
  - 檢查是否使用 `sealed class` 表示狀態機。
  - 建議用於 `when` 表達式的完整覆蓋。
- **協程使用**：
  - 檢查是否正確使用 `suspend` 函數。
  - 確保 `launch` / `async` 有對應的 `join()`。
- **數據類型**：
  - 檢查是否濫用 `data class`。
  - 建議僅用於純數據類型。

## 輸出格式 (Structured Review Report)

審查報告必須分為以下 4 個區塊：

### 1. 概述 (Summary)
- **總問題數**：編譯錯誤 + Detekt 警告 + 潛在錯誤。
- **嚴重等級**：Critical / High / Medium / Low。
- **建議行動**：立即修復 / 下次迭代 / 建議重構。

### 2. Kotlin 核心語言問題 (Kotlin Core Language Issues)
- **空值安全問題**：濫用 `!!` 運算子。
- **不可變性問題**：過度使用 `var`。
- **擴展函數問題**：濫用擴展函數。

### 3. 編譯器與 Detekt 問題 (Compiler & Detekt Issues)
- **未使用的變數**：`detekt` 的 `UnusedVariable` 規則。
- **潛在的 ClassCastException**：`detekt` 的 `CastToNullableType` 規則。
- **效能問題**：`detekt` 的效能警告（如 `ToString` 濫用）。

### 4. Kotlin 最佳實踐 (Kotlin Best Practices)
- **密封類型問題**：未使用 `sealed class`。
- **協程使用問題**：未正確使用 `suspend` 函數。
- **數據類型問題**：濫用 `data class`。

## ⚠️ 絕對禁忌
- **禁止盲目修復**：任何建議修復前，必須先解释問題根因。
- **禁止忽略編譯錯誤**：視為 Critical，必須優先處理。
- **禁止修改 `build.gradle` 未經確認**：配置變更必須與用戶討論。

## 📊 工具可用性检测 (Tool Availability Detection)

| 工具 | 檢測命令 | 降級策略 |
|------|----------|----------|
| `kotlinc` | `kotlinc -version` | 啟用語義分析模式 |
| `detekt` | `detekt --version` | 啟用語義分析模式 |

## 🔗 相關技能
- `bug-diagnose`：處理審查發現的具體錯誤。
- `tdd-enforcer`：確保審查通過後的代碼符合測試要求。
- `verification-before-completion`：確保審查報告在完工前完成。
