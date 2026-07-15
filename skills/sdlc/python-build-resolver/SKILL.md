---
name: python-build-resolver
description: 專業的 Python 編譯問題診斷與修復代理，自動解析套件安裝錯誤與依賴衝突。
---

# Python Build Resolver (Python 編譯問題診斷)

此技能用於自動診斷與修復 Python 專案的依賴安裝錯誤與套件衝突問題。它結合 `pip` 的錯誤輸出與 `pipdeptree` 的依賴樹分析，輸出結構化診斷報告。

## 診斷流程 (The Diagnosis Workflow)

### Phase 1: 環境檢測 (Environment Detection)
- **檢查 `pip` 可用性**：
  - 嘗試執行 `pip install .`。
  - 若失敗，提取錯誤訊息。
- **檢查 `pipdeptree` 可用性**：
  - 嘗試執行 `pipdeptree`。
  - 若成功，提取依賴樹資訊。

### Phase 2: 套件安裝錯誤解析 (Package Installation Error Parsing)
- **版本不兼容錯誤**：
  - 檢查 `Could not find a version that satisfies the requirement` 錯誤。
  - 提取套件名稱與版本需求。
- **依賴衝突錯誤**：
  - 檢查 `Cannot install <package> and <package>` 錯誤。
  - 提取衝突的套件與版本。
- **編譯錯誤**：
  - 檢查 `Failed building wheel` 錯誤。
  - 判斷是缺少編譯工具還是原生擴展問題。

### Phase 3: 套件版本衝突檢測 (Package Version Conflict Detection)
- **檢查 `requirements.txt` 與 `pyproject.toml`**：
  - 檢查是否有不一致的版本規範。
- **檢查依賴樹衝突**：
  - 使用 `pipdeptree` 分析依賴樹。
  - 檢查是否存在多個版本的同一套件。
- **常見衝突模式**：
  - `requests` 與 `urllib3` 版本衝突。
  - `numpy` 與 `pandas` 版本不匹配。

### Phase 4: 修復建議 (Fix Suggestions)
- **版本不兼容修復**：
  - 建議升級/降級套件 (`pip install <package>==<version>`)。
- **依賴衝突修復**：
  - 建議 `pip install --no-deps <package>` 或使用 `pip-compile`。
- **編譯錯誤修復**：
  - 建議安裝系統依賴 (`apt-get install ...`) 或使用預編譯 wheel。

## 輸出格式 (3-Section Response)

診斷報告必須分為以下 3 個區塊：

### 1. 診斷 (Diagnosis)
- **錯誤類型**：版本不兼容 / 依賴衝突 / 編譯錯誤。
- **錯誤位置**：套件名稱 + 版本需求（如 `requests>=2.25,<3.0`）。
- **根本原因**：簡單說明問題根因（如 `版本不兼容`、`依賴衝突`、`缺少編譯工具`）。

### 2. 修復 (Fix)
- **具體步驟**：
  - 版本不兼容：提供 `pip install <package>@<version>` 命令。
  - 依賴衝突：提供 `pip install --upgrade <package>` 命令。
  - 編譯錯誤：提供 `apt-get install` 命令。

### 3. 預防 (Prevention)
- **檢查清單**：
  - 使用 `pip-compile` 生成 `requirements.txt`。
  - 使用虛擬環境隔離依賴。
  - 鎖定版本 (`==`) 以確保可重現性。

## ⚠️ 絕對禁忌
- **禁止盲目修復**：任何修復前，必須先分析錯誤訊息。
- **禁止修改 `requirements.txt` 未經確認**：版本變更必須與用戶討論。
- **禁止忽略安裝錯誤**：`pip` 錯誤視為 Critical，必須優先處理。

## 📊 工具可用性检测 (Tool Availability Detection)

| 工具 | 檢測命令 | 降級策略 |
|------|----------|----------|
| `pip` | `pip --version` | 手動版本分析 |
| `pipdeptree` | `pipdeptree --version` | 手動依賴分析 |

## 🔗 相關技能
- `python-reviewer`：事前審查，預防編譯錯誤。
- `bug-diagnose`：處理診斷發現的具體錯誤。
- `verification-before-completion`：確保修復後安裝通過。
