---
name: rust-build-resolver
description: 專業的 Rust 編譯問題診斷與修復代理，自動解析依賴下載錯誤與套件版本衝突。
---

# Rust Build Resolver (Rust 編譯問題診斷)

此技能用於自動診斷與修復 Rust 專案的依賴下載錯誤與套件衝突問題。它結合 `cargo build` 的錯誤輸出與 `cargo metadata` 的套件分析，輸出結構化診斷報告。

## 診斷流程 (The Diagnosis Workflow)

### Phase 1: 環境檢測 (Environment Detection)
- **檢查 `cargo` 可用性**：
  - 嘗試執行 `cargo build`。
  - 若失敗，提取錯誤訊息。
- **檢查 `cargo metadata` 可用性**：
  - 嘗試執行 `cargo metadata --format-version 1`。
  - 若成功，提取套件資訊。

### Phase 2: 依賴下載錯誤解析 (Dependency Download Error Parsing)
- **套件下載錯誤**：
  - 檢查 `could not find <package> in registry` 錯誤。
  - 提取套件名稱與版本。
- **版本衝突錯誤**：
  - 檢查 `conflicting versions for dependency` 錯誤。
  - 提取衝突的套件與版本。
- **編譯錯誤**：
  - 檢查 `cannot find value` 錯誤。
  - 判斷是缺少 import 還是未導出符號。

### Phase 3: 套件版本衝突檢測 (Package Version Conflict Detection)
- **檢查 `Cargo.toml` 與 `Cargo.lock`**：
  - 檢查是否有不一致的版本。
- **檢查套件衝突**：
  - 使用 `cargo tree` 分析依賴樹。
  - 檢查是否存在多個版本的同一套件。
- **常見衝突模式**：
  - `serde` 與 `serde_derive` 版本不匹配。
  - `tokio` 與 `tokio-util` 版本衝突。

### Phase 4: 修復建議 (Fix Suggestions)
- **套件下載錯誤修復**：
  - 建議 `cargo update` 或手動修改 `Cargo.toml`。
- **版本衝突修復**：
  - 建議 `cargo add <package>@<version>` 或使用 `features`。
- **編譯錯誤修復**：
  - 建議 `cargo update <package>` 或修正 import 路徑。

## 輸出格式 (3-Section Response)

診斷報告必須分為以下 3 個區塊：

### 1. 診斷 (Diagnosis)
- **錯誤類型**：套件下載錯誤 / 版本衝突 / 編譯錯誤。
- **錯誤位置**：套件名稱 + 版本（如 `serde v1.0.152`）。
- **根本原因**：簡單說明問題根因（如 `版本不兼容`、`套件衝突`、`缺少 import`）。

### 2. 修復 (Fix)
- **具體步驟**：
  - 套件下載錯誤：提供 `cargo update` 命令。
  - 版本衝突：提供 `cargo add <package>@<version>` 命令。
  - 編譯錯誤：提供 `cargo update <package>` 命令。

### 3. 預防 (Prevention)
- **檢查清單**：
  - 使用 `cargo update` 保持 `Cargo.lock` 更新。
  - 使用語義化版本 (`1.0.0`) 以確保穩定性。
  - 鎖定依賴 (`version = "1.0"`)。

## ⚠️ 絕對禁忌
- **禁止盲目修復**：任何修復前，必須先分析錯誤訊息。
- **禁止修改 `Cargo.toml` 未經確認**：版本變更必須與用戶討論。
- **禁止忽略編譯錯誤**：`cargo build` 錯誤視為 Critical，必須優先處理。

## 📊 工具可用性检测 (Tool Availability Detection)

| 工具 | 檢測命令 | 降級策略 |
|------|----------|----------|
| `cargo` | `cargo --version` | 手動版本分析 |
| `cargo metadata` | `cargo metadata --version` | 手動套件分析 |

## 🔗 相關技能
- `rust-reviewer`：事前審查，預防編譯錯誤。
- `bug-diagnose`：處理診斷發現的具體錯誤。
- `verification-before-completion`：確保修復後編譯通過。
