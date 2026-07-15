---
name: python-reviewer
description: 專業的 Python 專家審查代理，結合靜態類型檢查 (mypy)、代碼分析 (pylint) 與 PEP 8 風格檢查。
---

# Python Reviewer (Python 專家審查)

此技能用於對 Python 專案進行系統化、專業級的代碼審查。它結合了 `mypy` 的靜態類型檢查與 `pylint` 的代碼品質分析，輸出結構化審查報告。

## 审查流程 (The Review Workflow)

### Phase 1: 環境檢測 (Environment Detection)
**核心：優先使用可用的硬體分析工具，降級至語義分析。**
- **檢查 `mypy` 可用性**：
  - 嘗試執行 `mypy .` 或 `python -m mypy .`。
  - 若成功，提取所有類型錯誤與警告。
- **檢查 `pylint` 可用性**：
  - 嘗試執行 `pylint .` 或 `python -m pylint .`。
  - 若成功，提取所有代碼品質問題。
- **降級至語義審查**：
  - 若兩者皆不可用，啟動「語義審查模式」，基於代碼結構與最佳實踐進行靜態分析。

### Phase 2: 類型安全分析 (Type Safety Analysis)
**核心：檢查 Python 類型提示 (Type Hints) 的正確性與完整性。**
- **類型提示缺失**：
  - 檢查函數參數與返回值是否缺少類型提示。
  - 建議為所有公共 API 添加類型提示。
- **類型不匹配**：
  - 檢查 `mypy` 報告的類型不匹配錯誤。
  - 確保變數賦值與類型提示一致。
- **Any 濫用**：
  - 檢查是否過度依賴 `Any` 類型。
  - 建議使用具體類型或 `TypeVar`。

### Phase 3: 代碼品質分析 (Code Quality Analysis)
**核心：檢查 pylint 的代碼品質指標與潛在錯誤。**
- **代碼風格違規**：
  - 檢查 PEP 8 風格問題（縮排、空格、命名）。
- **潛在錯誤**：
  - 檢查未使用的變數、未定義的變數、異常處理缺失。
- **代碼複雜度**：
  - 檢查cyclomatic complexity 指標。
  - 建議拆分過於複雜的函數。

### Phase 4: Python 最佳實踐 (Python Best Practices)
**核心：檢查是否遵循 Python 社群認可的最佳實踐。**
- **導入語法**：
  - 檢查是否使用 `from module import *`。
  - 建議使用明確導入 (`from module import X`)。
- **異常處理**：
  - 檢查是否使用寬泛的 `except Exception:`。
  - 建議捕獲特定異常類型。
- **資源管理**：
  - 檢查文件操作是否使用 `with open(...)`。
  - 確保資源正確釋放。

## 輸出格式 (Structured Review Report)

審查報告必須分為以下 4 個區塊：

### 1. 概述 (Summary)
- **總問題數**：類型錯誤 + Pylint 警告 + 潛在錯誤。
- **嚴重等級**：Critical / High / Medium / Low。
- **建議行動**：立即修復 / 下次迭代 / 建議重構。

### 2. 類型安全問題 (Type Safety Issues)
- **類型提示缺失**：函數參數與返回值缺少類型提示。
- **類型不匹配**：`mypy` 報告的類型不匹配錯誤。
- **Any 濫用**：過度依賴 `Any` 類型。

### 3. 代碼品質問題 (Code Quality Issues)
- **PEP 8 風格違規**：縮排、空格、命名不一致。
- **潛在錯誤**：未使用的變數、未定義的變數、異常處理缺失。
- **代碼複雜度**：cyclomatic complexity 過高。

### 4. Python 最佳實踐 (Python Best Practices)
- **導入語法問題**：使用 `from module import *`。
- **異常處理缺失**：捕獲過於寬泛的異常。
- **資源管理問題**：文件操作未使用 `with` 語句。

## ⚠️ 絕對禁忌
- **禁止盲目修復**：任何建議修復前，必須先解释問題根因。
- **禁止忽略類型錯誤**：`mypy` 錯誤視為 Critical，必須優先處理。
- **禁止修改 `pyproject.toml` 未經確認**：配置變更必須與用戶討論。

## 📊 工具可用性检测 (Tool Availability Detection)

| 工具 | 檢測命令 | 降級策略 |
|------|----------|----------|
| `mypy` | `mypy --version` | 啟用語義分析模式 |
| `pylint` | `pylint --version` | 啟用語義分析模式 |

## 🔗 相關技能
- `bug-diagnose`：處理審查發現的具體錯誤。
- `tdd-enforcer`：確保審查通過後的代碼符合測試要求。
- `verification-before-completion`：確保審查報告在完工前完成。
