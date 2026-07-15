# DEV_LOG.md — Skill Architect 開發記錄

> **遵守 Anti-Vibe Coding 紀律宣言**
> 每個 Bug 修復與系統改動，必須在此記錄其 RCA (Root Cause Analysis) 與 CAPA (Corrective and Preventive Actions) 的結構化紀錄。禁止「猜測性」無目的修復。
> 
> **標準診斷模板 (Standard Diagnostic Template)**
> - **Phase 1: Investigation (根因調查)** — 錯誤發現路徑、影響範圍、現象
> - **Phase 2: Pattern (模式辨識)** — 是否為範本對應問題、條件查核
> - **Phase 3: Hypothesis (假設與 RCA)** — 根本原因假設、驗證方法
> - **Phase 4: Fix & Verify (精準修復 CAPA)** — 修復邏輯、驗證結果、預防策略

---

## [2026-07-16] Strix 滲透掃描首次實戰執行 — 三連錯誤 RCA

### 任務內容
- 需求：對 SkillsBuilder 專案執行 Strix 滲透掃描測試。

### Bug 1 — WorkspaceArchiveWriteError
- 錯誤：`failed to write archive for path: \workspace\SkillsBuilder\raw`
- RCA：`raw/` 目錄含中文檔名（`Agent Builder 自動化開發要.md`），Docker tar 歸檔程式無法處理非 ASCII 路徑。
- CAPA：改用 `strix --mount ./` 替代 `strix --target ./`（bind-mount 不需複製，繞過歸檔問題）。

### Bug 2 — ContextWindowExceededError
- 錯誤：`The input (566,720 tokens) is longer than the model's context length (524,288 tokens)`
- RCA：整個 repo 含 `repo_tree.txt`（1.6MB）和 `tracked_files.txt`（1.7MB），token 量遠超 `agnes-2.0-flash` 上限。
- CAPA：建立 `pentest.ps1` smart mode，只將核心 App 程式碼（`index.html`, `tools/`, `hooks/`, `skills/core/`）複製至暫存目錄後再掃描。

### Bug 3 — ParserError: UnexpectedToken（PowerShell 腳本語法崩潰）
- 錯誤：`pentest.ps1:136 char:5 expected } was not found` / `pentest.ps1:217 unclosed string`
- RCA：中文字串寫入 `.ps1` 腳本後，PowerShell 在非 UTF-8 BOM 環境下讀取時字元序列被錯誤解析，破壞 `switch` 區塊與字串邊界。另外 `<` 在 double-quoted string 中被當作重定向符號。
- CAPA：`[System.IO.File]::WriteAllText(path, content, UTF8Encoding($true))` 強制寫入 UTF-8 BOM；程式碼字串改純 ASCII；規則寫入 `AGENTS.md` 第 8 節。

### Bug 4 — DEV_LOG.md 全面性混合編碼亂碼（628/1347 行）
- RCA：`DEV_LOG.md` 原為 CP950（Big5）編碼，長期由不同工具以不同編碼追加，形成 CP950 + UTF-8 混合體。在 AI 工具修復過程中，整體轉換導致原本的 UTF-8 片段被雙重編碼。
- CAPA：
  1. `git checkout 8feeef1 -- DEV_LOG.md` 還原 CP950 原版
  2. 讀取為 CP950，轉存為 UTF-8 BOM
  3. 新增 `.editorconfig` 強制所有工具使用 UTF-8
  4. 新增 `fix-encoding.ps1` 批次修復工具

### 最終結果
- ✅ `pentest.ps1 -Mode smart` 成功繞過三個問題，掃描完成。
- ✅ Strix 掃描結果：`CRITICAL:3 / HIGH:2`（詳見安全報告）。
- ✅ `DEV_LOG.md` 修復為 UTF-8 BOM，0 個編碼錯誤。
- ✅ `AGENTS.md` 第 8 節、`.editorconfig`、`fix-encoding.ps1` 已部署防護。

---

## [2026-07-16] 專案整體程式碼與檔案優化 (MECE 整理與全域清理)

### 任務內容
- **Cleanup**: 移除 untracked 亂碼目錄、備份檔案及髒資料。刪除 `raw/` 爬蟲殘留目錄，並將 `strix_runs/` 排除在 Git 追蹤外。
- **MECE Reorganization**: 將 `skills/` 目錄下的 80+ 技能，重新歸納至 5 個精確定義的目錄：`core`, `sdlc`, `agents`, `design`, `utils`。
- **Registry**: 建立 `.agents/skills.json` 配置以向 IDE 聲明非標準子目錄，確保技能探測功能正常。
- **Doc Sync**: 更新 Wiki 的 7 個實體與概念頁面路徑，並調整 `INSTALL.ps1` 與 `verify.ps1` 的內部路徑檢查。

### 確效結果
- ✅ 87 個技能的 `SKILL.md` frontmatter 格式全數通過檢驗。
- ✅ 15 個 ECC 整合技能在分類重構後全數通過 `verify.ps1` 驗證。
- ✅ 專案主 Wiki 及分類架構確效通過。

---


