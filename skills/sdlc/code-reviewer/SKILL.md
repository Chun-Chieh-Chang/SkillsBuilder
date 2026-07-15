---
name: code-reviewer
description: Performs automated audits and code reviews on changes, enforcing styling, security boundaries (no eval/exec), and regression checks.
---

# Code Reviewer (代碼審查)

This skill acts as a gatekeeper of codebase quality, scanning changes for common anti-patterns, import errors, security issues, and visual bugs.

## Trigger Keywords
- "審查代碼", "code review", "檢查 Bug", "dependency scan", "security audit"

## Prerequisites
- Static analysis tools (ESLint, Pylint, or project-specific linters)

## Code Quality Checkpoints

### 1. Security & Execution
- **NO DYNAMIC EXECUTION**: Ensure no usages of `eval()`, `exec()`, or dynamic runtime compiler generation.
- **DATA SANITIZATION**: Check inputs for proper sanitization before database insertion or terminal command building.

### 2. State & Dependencies
- **IMPORTS ACCURACY**: Verify that every package, model, or helper module imported actually exists in the codebase and is listed in the dependencies (`package.json` or `pyproject.toml`).
- **NO BROKEN DEPENDENCIES**: Ensure that removing or renaming a component does not break references in other files.

### 3. UI and Permissions Alignment
- **BUTTON & API ALIGNMENT**: If a backend API is restricted (e.g. `/admin/backups` needs admin rights), check that the corresponding frontend UI elements are conditionally rendered so that non-admin users cannot click them (preventing "403 buttons").

### 4. Code Style & Formatting
- **SPACING & LINT**: Verify there are no unused variables, trailing spaces, or syntax compilation warnings.
- **DOCSTRINGS**: Ensure that public functions have descriptive headers, but preserve any pre-existing unrelated comments/docs.

## Verification Loop
1. Review modified files -> verify: Identify modified regions and compile a list of affected modules.
2. Run syntax and type checks -> verify: Run linter/compiler command and ensure 0 errors.
3. Verify permissions alignment -> verify: Ensure restricted actions match UI button visibility.

---

## 🔗 Addy Osmani 精華整合 (from code-review-and-quality)

### 五軸審查框架
每次 Review 必須覆蓋五個維度：
1. **正確性** — 代碼是否做了它聲稱的？邊界情況？錯誤路徑？
2. **可讀性與簡潔性** — 能否在不需作者解釋的情況下理解？1000 行能用 100 行做到嗎？
3. **架構** — 是否符合系統設計？重構是否減少了複雜度還是只是移動了它？
4. **安全性** — 輸入驗證？密鑰管理？注入防護？外部數據源視為不可信？
5. **效能** — N+1 查詢？無界循環？不必要的重渲染？缺少分頁？

### 審查結果分級標記
| 前綴 | 含義 | 作者行動 |
|------|------|----------|
| *(無前綴)* | 必須修改 | 合併前必須處理 |
| **Critical:** | 阻擋合併 | 安全漏洞、數據丟失、功能壞掉 |
| **Nit:** | 次要、可選 | 作者可忽略 |
| **Optional:** / **Consider:** | 建議 | 值得考慮但非必需 |
| **FYI** | 僅供參考 | 無需行動 |

### 變更大小控制
```
~100 行  → 好。一次可審完。
~300 行  → 可接受（單一邏輯變更）
~1000 行 → 太大，必須拆分
```

### 依賴紀律
新增依賴前必問：
1. 現有技術棧能解決嗎？（通常可以）
2. 依賴多大？（檢查 bundle 影響）
3. 是否活躍維護？（最近 commit、open issues）
4. 有已知漏洞嗎？（`npm audit`）
5. 授權相容嗎？

### Dead Code 衛生
重構後必須檢查孤立代碼，列出並詢問後再刪除：
```
DEAD CODE IDENTIFIED:
- formatLegacyDate() in src/utils — replaced by formatDate()
- OldTaskCard component — replaced by TaskCard
→ Safe to remove?
```

