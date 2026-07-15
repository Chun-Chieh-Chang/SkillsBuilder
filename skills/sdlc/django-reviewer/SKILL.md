---
name: django-reviewer
description: 專業的 Django 專家審查代理，結合 flake8 代碼分析、django-lint 應用程式檢查與 Django 最佳實踐驗證。
---

# Django Reviewer (Django 專家審查)

此技能用於對 Django 專案進行系統化、專業級的代碼審查。它結合了 `flake8` 的 Python 代碼分析與 `django-lint` 的 Django 專用檢查，輸出結構化審查報告。

## 审查流程 (The Review Workflow)

### Phase 1: 環境檢測 (Environment Detection)
**核心：優先使用可用的硬體分析工具，降級至語義分析。**
- **檢查 `flake8` 可用性**：
  - 嘗試執行 `flake8 .`。
  - 若成功，提取所有 PEP 8 風格與潛在錯誤。
- **檢查 `django-lint` 可用性**：
  - 嘗試執行 `django-lint .`。
  - 若成功，提取所有 Django 專用檢查警告。
- **降級至語義審查**：
  - 若兩者皆不可用，啟動「語義審查模式」，基於代碼結構與最佳實踐進行靜態分析。

### Phase 2: Django 專用模型檢查 (Django Model Analysis)
**核心：檢查 Django ORM 的模型設計與最佳實踐。**
- **模型設計**：
  - 檢查是否缺少 `blank=True` / `null=True`。
  - 確保 `CharField` 有 `max_length`。
- **關係設計**：
  - 檢查 `ForeignKey` 是否缺少 `on_delete` 參數。
  - 確保 `ManyToManyField` 使用 `through` 模型。
- **索引與效能**：
  - 檢查是否缺少 `db_index=True`。
  - 建議為頻繁查詢的字段添加索引。

### Phase 3: 視圖與 URL 設計 (View & URL Design)
**核心：檢查 Django 視圖與 URL 路由的設計。**
- **視圖設計**：
  - 檢查是否使用 `ListView` / `DetailView` 等通用視圖。
  - 確保視圖函數有明確的返回值。
- **URL 設計**：
  - 檢查是否使用 `path()` / `re_path()`。
  - 確保 URL 模式有明確的 `name` 參數。
- **認證與授權**：
  - 檢查是否缺少 `@login_required`。
  - 確保敏感操作有權限檢查。

### Phase 4: Python 代碼品質 (Python Code Quality)
**核心：檢查 flake8 的代碼品質指標。**
- **PEP 8 風格**：
  - 檢查縮排、空格、命名是否符合 PEP 8。
- **潛在錯誤**：
  - 檢查未使用的變數、未定義的變數。
- **代碼複雜度**：
  - 檢查 cyclomatic complexity 指標。

## 輸出格式 (Structured Review Report)

審查報告必須分為以下 4 個區塊：

### 1. 概述 (Summary)
- **總問題數**：Django 專用問題 + flake8 警告 + 潛在錯誤。
- **嚴重等級**：Critical / High / Medium / Low。
- **建議行動**：立即修復 / 下次迭代 / 建議重構。

### 2. Django 專用問題 (Django-Specific Issues)
- **模型設計問題**：缺少 `blank=True` / `null=True`。
- **關係設計問題**：缺少 `on_delete` 參數。
- **索引問題**：缺少 `db_index=True`。

### 3. 視圖與 URL 問題 (View & URL Issues)
- **視圖設計問題**：未使用通用視圖。
- **URL 設計問題**：缺少 `name` 參數。
- **認證問題**：缺少 `@login_required`。

### 4. Python 代碼品質 (Python Code Quality)
- **PEP 8 風格違規**：縮排、空格、命名不一致。
- **潛在錯誤**：未使用的變數、未定義的變數。
- **代碼複雜度**：cyclomatic complexity 過高。

## ⚠️ 絕對禁忌
- **禁止盲目修復**：任何建議修復前，必須先解释問題根因。
- **禁止忽略 Django 專用錯誤**：視為 Critical，必須優先處理。
- **禁止修改 `settings.py` 未經確認**：配置變更必須與用戶討論。

## 📊 工具可用性检测 (Tool Availability Detection)

| 工具 | 檢測命令 | 降級策略 |
|------|----------|----------|
| `flake8` | `flake8 --version` | 啟用語義分析模式 |
| `django-lint` | `django-lint --version` | 啟用語義分析模式 |

## 🔗 相關技能
- `bug-diagnose`：處理審查發現的具體錯誤。
- `tdd-enforcer`：確保審查通過後的代碼符合測試要求。
- `verification-before-completion`：確保審查報告在完工前完成。
