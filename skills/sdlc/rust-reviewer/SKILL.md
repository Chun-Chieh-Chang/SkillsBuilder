---
name: rust-reviewer
description: 專業的 Rust 專家審查代理，結合 rustc 編譯器檢查、clippy 靜態分析與 Rust 最佳實踐驗證。
---

# Rust Reviewer (Rust 專家審查)

此技能用於對 Rust 專案進行系統化、專業級的代碼審查。它結合了 `rustc` 的嚴格編譯檢查與 `clippy` 的靜態分析，輸出結構化審查報告。

## 审查流程 (The Review Workflow)

### Phase 1: 環境檢測 (Environment Detection)
**核心：優先使用可用的硬體分析工具，降級至語義分析。**
- **檢查 `rustc` 可用性**：
  - 嘗試執行 `rustc --version`。
  - 若成功，提取所有編譯錯誤與警告。
- **檢查 `clippy` 可用性**：
  - 嘗試執行 `cargo clippy`。
  - 若成功，提取所有 linting 問題。
- **降級至語義審查**：
  - 若兩者皆不可用，啟動「語義審查模式」，基於代碼結構與最佳實踐進行靜態分析。

### Phase 2: 所有權分析 (Ownership Analysis)
**核心：檢查 Rust 所有權系統的正確性與效率。**
- **借用錯誤**：
  - 檢查是否違反借用規則（同時可變借用、懸垂引用）。
- **過度借用**：
  - 檢查是否過度使用 `&mut` 或 `Rc` / `Arc`。
  - 建議使用 `&` 除非需要可變性。
- **內存泄漏風險**：
  - 檢查是否意外循環引用 `Rc`。
  - 建議使用 `Weak` 打斷循環。

### Phase 3: 編譯器與 Clippy 分析 (Compiler & Clippy Analysis)
**核心：檢查 rustc 的嚴格檢查與 clippy 的代碼品質建議。**
- **未使用的變數**：
  - 檢查 `rustc` 的 `unused_variables` 警告。
- **潛在的 panic**：
  - 檢查 `clippy` 的 `unwrap` / `expect` 警告。
  - 建議使用 `match` 或 `?` 運算子。
- **效能問題**：
  - 檢查 `clippy` 的效能警告（如 `clone` 濫用）。

### Phase 4: Rust 最佳實踐 (Rust Best Practices)
**核心：檢查是否遵循 Rust 社群認可的最佳實踐。**
- **錯誤處理**：
  - 檢查是否使用 `panic!` 處理正常錯誤。
  - 建議使用 `Result` / `Option`。
- **泛型與特徵**：
  - 檢查是否過度使用泛型。
  - 建議使用特徵 bounds (`trait bounds`)。
- **宏使用**：
  - 檢查是否濫用宏（`macro_rules!`）。
  - 建議優先使用函數。

## 輸出格式 (Structured Review Report)

審查報告必須分為以下 4 個區塊：

### 1. 概述 (Summary)
- **總問題數**：編譯錯誤 + Clippy 警告 + 潛在錯誤。
- **嚴重等級**：Critical / High / Medium / Low。
- **建議行動**：立即修復 / 下次迭代 / 建議重構。

### 2. 所有權問題 (Ownership Issues)
- **借用錯誤**：違反借用規則的代碼。
- **過度借用**：使用 `&mut` / `Rc` 過度。
- **內存泄漏風險**：循環引用 `Rc`。

### 3. 編譯器與 Clippy 問題 (Compiler & Clippy Issues)
- **未使用的變數**：`rustc` 的 `unused_variables` 警告。
- **潛在的 panic**：`clippy` 的 `unwrap` / `expect` 警告。
- **效能問題**：`clippy` 的效能警告（如 `clone` 濫用）。

### 4. Rust 最佳實踐 (Rust Best Practices)
- **錯誤處理問題**：使用 `panic!` 處理正常錯誤。
- **泛型問題**：過度使用泛型。
- **宏使用問題**：濫用 `macro_rules!`。

## ⚠️ 絕對禁忌
- **禁止盲目修復**：任何建議修復前，必須先解释問題根因。
- **禁止忽略編譯錯誤**：視為 Critical，必須優先處理。
- **禁止修改 `Cargo.toml` 未經確認**：配置變更必須與用戶討論。

## 📊 工具可用性检测 (Tool Availability Detection)

| 工具 | 檢測命令 | 降級策略 |
|------|----------|----------|
| `rustc` | `rustc --version` | 啟用語義分析模式 |
| `clippy` | `cargo clippy --version` | 啟用語義分析模式 |

## 🔗 相關技能
- `bug-diagnose`：處理審查發現的具體錯誤。
- `tdd-enforcer`：確保審查通過後的代碼符合測試要求。
- `verification-before-completion`：確保審查報告在完工前完成。
