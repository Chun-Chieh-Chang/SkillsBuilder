---
name: go-reviewer
description: 專業的 Go 專家審查代理，結合 gofmt 格式檢查、go vet 靜態分析與 Go 最佳實踐驗證。
---

# Go Reviewer (Go 專家審查)

此技能用於對 Go 專案進行系統化、專業級的代碼審查。它結合了 `gofmt` 的格式檢查與 `go vet` 的靜態分析，輸出結構化審查報告。

## 审查流程 (The Review Workflow)

### Phase 1: 環境檢測 (Environment Detection)
**核心：優先使用可用的硬體分析工具，降級至語義分析。**
- **檢查 `gofmt` 可用性**：
  - 嘗試執行 `gofmt -l .`。
  - 若成功，提取所有格式問題。
- **檢查 `go vet` 可用性**：
  - 嘗試執行 `go vet ./...`。
  - 若成功，提取所有靜態分析警告。
- **降級至語義審查**：
  - 若兩者皆不可用，啟動「語義審查模式」，基於代碼結構與最佳實踐進行靜態分析。

### Phase 2: 代碼格式分析 (Code Format Analysis)
**核心：檢查代碼是否符合 Go 官方風格指南。**
- **縮排與空格**：
  - 檢查是否使用 tab 縮排而非空格。
  - 確保一級縮排為 8 個空格（Go 官方標準）。
- **import 分組**：
  - 檢查 import 是否分為標準庫與第三方庫兩組。
  - 確保每組內按字母排序。
- **函數長度**：
  - 檢查函數是否過長（建議 <50 行）。

### Phase 3: 靜態分析 (Static Analysis)
**核心：檢查 `go vet` 報告的潛在錯誤。**
- **未使用的變數**：
  - 檢查 `go vet` 報告的未使用變數警告。
- **錯誤處理缺失**：
  - 檢查是否忽略 `error` 返回值。
  - 建議使用 `if err != nil` 處理所有錯誤。
- **並發問題**：
  - 檢查是否缺少 `context.Context` 傳遞。
  - 確保 channel 操作有對應的 `close()`。

### Phase 4: Go 最佳實踐 (Go Best Practices)
**核心：檢查是否遵循 Go 社群認可的最佳實踐。**
- **介面設計**：
  - 檢查是否過度依賴具體類型而非介面。
  - 建議使用小介面（Interface Segregation）。
- **錯誤處理**：
  - 檢查是否使用 `panic` 處理正常錯誤。
  - 建議使用 `error` 返回值。
- **效能優化**：
  - 檢查是否過度使用 `make()` 與 `new()`。
  - 建議優先使用值類型而非指針。

## 輸出格式 (Structured Review Report)

審查報告必須分為以下 4 個區塊：

### 1. 概述 (Summary)
- **總問題數**：格式問題 + `go vet` 警告 + 潛在錯誤。
- **嚴重等級**：Critical / High / Medium / Low。
- **建議行動**：立即修復 / 下次迭代 / 建議重構。

### 2. 代碼格式問題 (Code Format Issues)
- **縮排不一致**：混合使用 tab 與空格。
- **import 分組錯誤**：未分組或排序錯誤。
- **函數過長**：單個函數超過 50 行。

### 3. 靜態分析問題 (Static Analysis Issues)
- **未使用變數**：`go vet` 報告的未使用變數。
- **錯誤處理缺失**：忽略 `error` 返回值。
- **並發問題**：缺少 `context.Context` 或 channel 使用錯誤。

### 4. Go 最佳實踐 (Go Best Practices)
- **介面設計問題**：過度依賴具體類型。
- **錯誤處理問題**：使用 `panic` 處理正常錯誤。
- **效能問題**：過度使用 `make()` 與 `new()`。

## ⚠️ 絕對禁忌
- **禁止盲目修復**：任何建議修復前，必須先解释問題根因。
- **禁止忽略 `go vet` 錯誤**：視為 Critical，必須優先處理。
- **禁止修改 `go.mod` 未經確認**：配置變更必須與用戶討論。

## 📊 工具可用性检测 (Tool Availability Detection)

| 工具 | 檢測命令 | 降級策略 |
|------|----------|----------|
| `gofmt` | `gofmt -version` | 啟用語義分析模式 |
| `go vet` | `go version` | 啟用語義分析模式 |

## 🔗 相關技能
- `bug-diagnose`：處理審查發現的具體錯誤。
- `tdd-enforcer`：確保審查通過後的代碼符合測試要求。
- `verification-before-completion`：確保審查報告在完工前完成。
