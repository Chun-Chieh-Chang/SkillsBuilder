---
name: go-build-resolver
description: 專業的 Go 編譯問題診斷與修復代理，自動解析依賴下載錯誤與模組衝突。
---

# Go Build Resolver (Go 編譯問題診斷)

此技能用於自動診斷與修復 Go 專案的依賴下載錯誤與模組衝突問題。它結合 `go build` 的錯誤輸出與 `go mod` 的模組分析，輸出結構化診斷報告。

## 診斷流程 (The Diagnosis Workflow)

### Phase 1: 環境檢測 (Environment Detection)
- **檢查 `go` 可用性**：
  - 嘗試執行 `go build ./...`。
  - 若失敗，提取錯誤訊息。
- **檢查 `go mod` 可用性**：
  - 嘗試執行 `go mod tidy`。
  - 若成功，提取模組資訊。

### Phase 2: 依賴下載錯誤解析 (Dependency Download Error Parsing)
- **模組下載錯誤**：
  - 檢查 `cannot find package` 錯誤。
  - 提取模組路徑與版本。
- **版本衝突錯誤**：
  - 檢查 `ambiguous import` 錯誤。
  - 提取衝突的模組與版本。
- **編譯錯誤**：
  - 檢查 `undefined: X` 錯誤。
  - 判斷是缺少 import 還是未導出符號。

### Phase 3: 模組版本衝突檢測 (Module Version Conflict Detection)
- **檢查 `go.mod` 與 `go.sum`**：
  - 檢查是否有不一致的版本。
- **檢查模組衝突**：
  - 使用 `go mod graph` 分析依賴樹。
  - 檢查是否存在多個版本的同一模組。
- **常見衝突模式**：
  - `github.com/stretchr/testify` 版本衝突。
  - `google.golang.org/grpc` 與 `google.golang.org/protobuf` 版本不匹配。

### Phase 4: 修復建議 (Fix Suggestions)
- **模組下載錯誤修復**：
  - 建議 `go mod tidy` 或手動添加 `replace` 指令。
- **版本衝突修復**：
  - 建議 `go get <module>@<version>` 或使用 `replace` 指令。
- **編譯錯誤修復**：
  - 建議 `go get <module>` 或修正 import 路徑。

## 輸出格式 (3-Section Response)

診斷報告必須分為以下 3 個區塊：

### 1. 診斷 (Diagnosis)
- **錯誤類型**：模組下載錯誤 / 版本衝突 / 編譯錯誤。
- **錯誤位置**：模組路徑 + 版本（如 `github.com/stretchr/testify v1.8.0`）。
- **根本原因**：簡單說明問題根因（如 `版本不兼容`、`模組衝突`、`缺少 import`）。

### 2. 修復 (Fix)
- **具體步驟**：
  - 模組下載錯誤：提供 `go mod tidy` 命令。
  - 版本衝突：提供 `go get <module>@<version>` 命令。
  - 編譯錯誤：提供 `go get <module>` 命令。

### 3. 預防 (Prevention)
- **檢查清單**：
  - 使用 `go mod tidy` 保持 `go.mod` 更新。
  - 使用語義化版本 (`v1.0.0`) 以確保穩定性。
  - 鎖定依賴 (`require <module> v1.0.0`)。

## ⚠️ 絕對禁忌
- **禁止盲目修復**：任何修復前，必須先分析錯誤訊息。
- **禁止修改 `go.mod` 未經確認**：版本變更必須與用戶討論。
- **禁止忽略編譯錯誤**：`go build` 錯誤視為 Critical，必須優先處理。

## 📊 工具可用性检测 (Tool Availability Detection)

| 工具 | 檢測命令 | 降級策略 |
|------|----------|----------|
| `go` | `go version` | 手動版本分析 |
| `go mod` | `go mod version` | 手動模組分析 |

## 🔗 相關技能
- `go-reviewer`：事前審查，預防編譯錯誤。
- `bug-diagnose`：處理診斷發現的具體錯誤。
- `verification-before-completion`：確保修復後編譯通過。
