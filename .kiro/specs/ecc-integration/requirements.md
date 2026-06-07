# Requirements Document

## Introduction

本功能旨在評估並選擇性地整合 [ECC（Everything Claude Code）](https://github.com/affaan-m/ECC) 框架的核心能力至 SkillsBuilder 專案，使 SkillsBuilder 成為 ECC 優勢與自身既有能力的功能超集（Superset）。

ECC 是一個生產就緒的 AI Coding Agent 強化框架，擁有 63 個專業化 Subagent、251 個 Workflow Skills、79 個 Slash Commands、AgentShield 安全掃描系統、Hooks 自動化系統、14 個 MCP Server 配置，以及模組化 Rules 架構。

整合目標分為五個面向：
1. **語言專屬 Reviewer/Resolver Agents**：擴充現有 `code-reviewer` 為多語言版本
2. **AgentShield 安全掃描**：於 git push 前自動執行多層安全審查
3. **Hooks 自動化強化**：補強現有 hooks 機制（型別檢查、格式化、偵測、自動修復）
4. **Harness Optimizer 概念引入**：Context Window 管理與成本優化
5. **ECC Skills 橋接機制**：建立 ECC Workflow Skills 遷移至 SkillsBuilder 的標準路徑

---

## Glossary

- **SkillsBuilder**：本專案，一個 AI Agent Skill 元平台，現有 42 個技能，支援 13 個 IDE 的 rules 同步
- **ECC**：Everything Claude Code，來源框架，提供 63 個 Subagent、251 個 Workflow Skills、79 個 Slash Commands
- **Skill**：SkillsBuilder 中的最小技能單元，以目錄形式存放於 `skills/{category}/{skill-name}/`
- **AgentShield**：ECC 的安全掃描子系統，於 git push 觸發前執行代碼安全審查
- **Hook**：IDE 或 git 事件觸發器，在特定動作前後自動執行腳本或 Agent
- **Harness_Optimizer**：ECC 中負責管理 Context Window、控制 token 消耗與優化吞吐量的元件
- **Loop_Operator**：ECC 中自主監控 Agent 執行迴路、偵測異常並介入的元件
- **Language_Reviewer**：針對特定程式語言（TypeScript、Python、Go、Rust 等）執行語法、風格、最佳實踐審查的 Subagent
- **Language_Resolver**：針對特定語言的建構失敗（build error）進行自動診斷與修復的 Subagent
- **Migration_Bridge**：將 ECC Workflow Skills 格式轉換為 SkillsBuilder Skill 格式的轉換工具或腳本
- **INSTALL.ps1**：SkillsBuilder 現有的一鍵同步腳本，將 `skills/` 目錄連結至全域技能池
- **CLAUDE.md**：SkillsBuilder 的主要規則來源文件，為 13 個 IDE 規則的 Source of Truth
- **verify.ps1**：SkillsBuilder 現有確效腳本，執行 LINT 與同步完整性檢查

---

## Requirements

### Requirement 1: 語言專屬 Reviewer Agent 技能擴充

**User Story:** 身為 SkillsBuilder 使用者，我希望能針對不同程式語言（TypeScript、Python、Go、Rust、Django、Kotlin）取得語言專屬的代碼審查建議，以便在使用單一語言開發時獲得更精準的審查回饋，而非只依賴通用的 `code-reviewer`。

#### Acceptance Criteria

1. THE SkillsBuilder SHALL 在 `skills/dev/` 目錄下新增以下語言專屬 Reviewer 技能目錄：`typescript-reviewer`、`python-reviewer`、`go-reviewer`、`rust-reviewer`、`django-reviewer`、`kotlin-reviewer`；每個目錄均包含 `SKILL.md` 文件，且 `SKILL.md` 包含 YAML frontmatter 欄位 `name`、`description`、`Trigger Keywords`、`Prerequisites`

2. WHEN 使用者呼叫任一語言專屬 Reviewer 技能時，THE Language_Reviewer SHALL 輸出包含四個固定區塊的審查報告：「語法規範違反」、「慣用寫法改進建議」、「最佳實踐合規性」、「摘要（含問題數量統計）」

3. WHEN Language_Reviewer 在報告中識別問題時，THE Language_Reviewer SHALL 依下列定義標示嚴重程度：Critical = 會導致執行時期錯誤、安全漏洞或資源洩漏的問題（如 TypeScript `any` 濫用於邊界 API、Python 裸 `except`、Go goroutine 洩漏）；Warning = 違反語言慣用寫法或最佳實踐但不影響執行的問題；Info = 可選的程式碼風格建議

4. THE SkillsBuilder SHALL 確保每個語言專屬 Reviewer 技能的目錄路徑為 `skills/dev/{skill-name}/`，並且 `SKILL.md` 的 YAML frontmatter 包含 `name`（與目錄名稱相同）、`description`（單行描述）、`Trigger Keywords`（至少三個觸發關鍵詞）、`Prerequisites`（列出所依賴的靜態分析工具）四個欄位

5. WHEN 語言專屬 Reviewer 每次被呼叫時，THE Language_Reviewer SHALL 在輸出開頭檢測並列出對應靜態分析工具的可用性狀態（例如 TypeScript-reviewer 列出 `tsc`、`eslint`；Python-reviewer 列出 `pylint`、`mypy`），格式為 `[可用]` 或 `[不可用]`

6. IF 語言專屬 Reviewer 偵測到所有靜態分析工具均不可用，THEN THE Language_Reviewer SHALL 在報告開頭第一行輸出「靜態分析不可用，已切換至語意審查模式」，並繼續輸出與完整模式相同的四個報告區塊（語法規範違反、慣用寫法改進建議、最佳實踐合規性、摘要），審查流程不中止

---

### Requirement 2: 語言專屬 Build Error Resolver Agent 技能擴充

**User Story:** 身為 SkillsBuilder 使用者，我希望能針對特定語言的建構錯誤（build error）自動取得診斷與修復建議，以便縮短除錯時間，而非手動查閱錯誤訊息。

#### Acceptance Criteria

1. THE SkillsBuilder SHALL 在 `skills/dev/` 目錄下新增以下語言專屬 Resolver 技能目錄：`typescript-build-resolver`、`python-build-resolver`、`go-build-resolver`、`rust-build-resolver`；每個目錄包含 `SKILL.md`，且 `SKILL.md` 包含 YAML frontmatter 欄位 `name`、`description`、`Trigger Keywords`、`Prerequisites`

2. WHEN 使用者提供建構錯誤訊息並呼叫對應 Language_Resolver 時，THE Language_Resolver SHALL 解析錯誤訊息、識別根因，並在「修復」區塊中提供至少一個包含可執行命令或具體代碼變更指令的修復步驟

3. WHEN Language_Resolver 提供修復建議時，THE Language_Resolver SHALL 輸出包含三個區塊的回應：「診斷」（至少一個完整句子說明根因）、「修復」（至少一個可執行命令或代碼變更）、「預防」（至少一個完整句子說明如何避免同類錯誤）

4. IF 建構錯誤來源為相依套件版本衝突，THEN THE Language_Resolver SHALL 在「診斷」區塊中以 `套件名稱@版本範圍` 格式（例如 `react@^18.0.0`）標示衝突的套件名稱與版本範圍，並在「修復」區塊給出兼容版本的具體安裝命令

5. IF 使用者提供的錯誤訊息為空或無法識別為已知錯誤格式，THEN THE Language_Resolver SHALL 輸出「無法識別的錯誤格式」提示，並請求使用者提供完整的錯誤輸出（包含錯誤碼、檔案位置、上下文行號）

6. THE SkillsBuilder SHALL 確保每個語言專屬 Resolver 技能路徑為 `skills/dev/{skill-name}/`，且 `SKILL.md` 的 YAML frontmatter 包含與目錄名稱相同的 `name` 欄位及 `description`、`Trigger Keywords`、`Prerequisites` 欄位

---

### Requirement 3: AgentShield 安全掃描整合

**User Story:** 身為 SkillsBuilder 開發者，我希望在執行 git push 之前自動觸發安全審查，以便在代碼進入版本庫前攔截高風險安全問題，以及偵測潛在的注入漏洞，而非事後才發現安全漏洞。

#### Acceptance Criteria

1. THE SkillsBuilder SHALL 在 `skills/dev/` 目錄下新增 `agent-shield` 技能目錄，包含 `SKILL.md`（含 YAML frontmatter `name`、`description`、`Trigger Keywords`、`Prerequisites`）及 Hook 整合配置範例文件

2. WHEN git push 事件被觸發時，THE AgentShield SHALL 在 120 秒逾時限制內，針對本次 commit 的 staged 文件，依序執行以下四項掃描：(a) 硬編碼秘鑰（API Key、密碼、Token 正則模式）偵測；(b) `eval()` 與 `exec()` 動態執行指令偵測；(c) 相依套件的已知高風險版本掃描（對照 CVE 資料庫或 package.json / requirements.txt）；(d) SQL 與 Shell 注入風險模式偵測

3. WHEN AgentShield 偵測到 Critical 級別問題（定義：可直接導致認證繞過、資料外洩或遠端代碼執行的安全漏洞，或 `eval()`/`exec()` 動態執行）時，THE AgentShield SHALL 以非零 exit code 中止 git push 流程，並輸出包含以下欄位的結構化報告：「問題類型」（掃描項目 a/b/c/d 的具體分類）、「檔案路徑與行號」（格式 `path/to/file.ts:42`）、「修復建議」（至少一個具體行動）

4. WHEN AgentShield 偵測到 Warning 級別問題（定義：符合安全最佳實踐缺失但不直接可利用的問題，如缺少輸入驗證、密碼以弱雜湊儲存）時，THE AgentShield SHALL 以零 exit code 允許 git push 繼續，並在報告末尾輸出「通過掃描（有 N 個警告）」（N 為 Warning 數量）的文字摘要

5. WHEN AgentShield 完成所有四項掃描且無任何 Critical 或 Warning 問題時，THE AgentShield SHALL 輸出「安全掃描通過」確認文字，並在同一輸出行記錄掃描完成的 ISO 8601 時間戳記（格式 `YYYY-MM-DDTHH:MM:SSZ`）

6. THE SkillsBuilder SHALL 在 `skills/dev/agent-shield/` 目錄下提供 `hook-examples/` 子目錄，包含至少兩個 Hook 配置範例文件：`kiro-hook.json`（符合 Kiro preToolUse Hook schema）與 `claude-code-hook.json`（符合 Claude Code PreToolUse hook 格式），說明如何在 git push 工具執行前掛載 AgentShield

7. WHERE 使用者已啟用 AgentShield 且當前環境無法存取 git（如 git 指令不存在），THE AgentShield SHALL 以手動模式執行，接受使用者貼入不超過 500 行的代碼片段，並依序執行上述掃描項目 (a)(b)(d) 的即時掃描（排除需解析 package 文件的項目 c）

8. WHEN AgentShield 的掃描超過 120 秒逾時時，THE AgentShield SHALL 輸出「掃描逾時，已完成 N 項掃描，第 M 項未完成」（N、M 為實際數值）並以非零 exit code 中止，避免阻塞 git push 流程

---

### Requirement 4: Hooks 自動化系統強化

**User Story:** 身為 SkillsBuilder 使用者，我希望透過強化的 Hooks 系統在代碼修改時自動執行型別檢查、格式化與品質偵測，以便無需手動記得執行這些工具。

#### Acceptance Criteria

1. THE SkillsBuilder SHALL 在 `skills/dev/` 目錄下新增 `hooks-enhancer` 技能目錄，包含 `SKILL.md`（含 YAML frontmatter 欄位）及至少四個 Hook 配置範本文件

2. THE hooks-enhancer SHALL 包含以下四種 Hook 配置範本：(a) `auto-formatter`（儲存後自動執行 Prettier / Black / gofmt 等格式化工具）；(b) `tsc-type-check`（TypeScript 檔案修改後自動執行 `tsc --noEmit` 型別檢查）；(c) `console-log-detector`（偵測代碼中殘留的 `console.log` / `print` 除錯語句，並標示所在行號）；(d) `import-validator`（儲存時識別無法解析的 import 路徑或 `package.json`/`requirements.txt` 中未宣告的依賴）

3. WHEN 使用者執行 `hooks-enhancer` 技能並選擇目標 IDE 時，THE hooks-enhancer SHALL 依照以下格式輸出對應的配置文件：Kiro → 符合 `.kiro/hooks/*.json` schema 的 JSON 文件；Claude Code → 符合 `.claude/settings.json` 的 hooks 陣列格式；Cursor → 符合 `hooks-cursor.json` 格式（與現有 `hooks/hooks-cursor.json` 一致）

4. WHEN 代碼文件被修改且 Hook 配置已部署至目標 IDE，THE Hook SHALL 在對應事件（PreToolUse / PostToolUse / 檔案儲存）觸發時自動執行，並將執行結果輸出至目標 IDE 的輸出面板，不需要使用者手動呼叫

5. IF Hook 執行過程中發生工具不存在的錯誤（如 Prettier 未安裝），THEN THE hooks-enhancer SHALL 輸出工具安裝指令，並確保其餘尚未遇到工具不存在錯誤的 Hooks 繼續執行至完成

6. WHEN `INSTALL.ps1` 執行完成時，THE INSTALL.ps1 SHALL 在輸出摘要中包含 `hooks-enhancer` 的狀態報告，以 `[可用]`（工具在系統 PATH 中可偵測）或 `[不可用]`（工具未在系統 PATH 中偵測到）標示四個 Hook 範本（auto-formatter、tsc-type-check、console-log-detector、import-validator）各自的當前狀態

---

### Requirement 5: Harness Optimizer 概念引入

**User Story:** 身為頻繁使用大型代碼庫的 SkillsBuilder 使用者，我希望能自動管理 Context Window 使用量並估算 token 成本，以便在執行大型任務時不超出 Context 限制且能控制 API 費用。

#### Acceptance Criteria

1. THE SkillsBuilder SHALL 在 `skills/dev/` 目錄下新增 `harness-optimizer` 技能目錄，包含 `SKILL.md`（含 YAML frontmatter `name`、`description`、`Trigger Keywords`、`Prerequisites`）

2. WHEN 使用者呼叫 `harness-optimizer` 技能時，THE Harness_Optimizer SHALL 輸出包含三個固定區塊的報告：「目前已用 token」（以數字與佔用百分比表示）、「預估剩餘可用 token」（以數字表示）、「建議的上下文裁剪策略」（列出至少一個具體的裁剪行動，如「以 `graphify query` 替代全文讀取 X 個文件」）

3. WHEN Harness_Optimizer 偵測到當前 Context 已超過目標模型 Context Window 的 80% 時，THE Harness_Optimizer SHALL 主動建議使用者透過 `graphify` 低 token 查詢替代全文讀取，並在「建議的上下文裁剪策略」區塊列出至少一個具體可裁剪的低優先級上下文項目（如「已讀取但超過 5 分鐘未參照的文件」）

4. WHEN Context 需要優化時，THE Harness_Optimizer SHALL 以 `graphify query <topic>` 指令格式替代直接讀取完整代碼檔案，並在輸出中說明此替代節省的預估 token 數量

5. WHEN 使用者執行的任務涉及超過 5 個模組的依賴深度時，THE Harness_Optimizer SHALL 在任務開始前呼叫 `graphify query` 取得依賴拓撲摘要，並輸出「模組數量 N，依賴深度 D，建議分批執行：批次 1 [模組列表]，批次 2 [模組列表]」格式的建議

6. WHERE 使用者已在 `harness-optimizer` 技能中啟用成本追蹤模式（透過 SKILL.md 中的 `cost-tracking: true` 設定），THE Harness_Optimizer SHALL 在每次技能執行後輸出本次消耗的估算 token 數，並在使用者明確輸入「結束 session」時輸出含總消耗 token 數與各技能分項消耗的成本摘要報告

---

### Requirement 6: ECC Skills 橋接機制

**User Story:** 身為希望引入 ECC Workflow Skills 的 SkillsBuilder 使用者，我希望能透過標準化工具將 ECC 的 Skills 格式轉換為 SkillsBuilder 相容格式，以便充分利用 ECC 現成的 Workflow Skills，而無需手動重寫每一個技能。

#### Acceptance Criteria

1. THE SkillsBuilder SHALL 在 `skills/dev/` 目錄下新增 `ecc-migrator` 技能目錄，包含 `SKILL.md`（含 YAML frontmatter 欄位）及 `ecc-compatibility-matrix.md` 文件

2. WHEN 使用者提供 ECC Skill 的原始內容（YAML 或 Markdown 格式）時，THE ecc-migrator SHALL 分析其格式結構，並輸出包含完整 YAML frontmatter（`name`、`description`、`Trigger Keywords`、`Prerequisites`）的 SkillsBuilder `SKILL.md` 格式草稿

3. THE ecc-migrator SHALL 在輸出的技能草稿中，以 `# [REVIEW NEEDED]: <原因說明>` 內嵌註解標記需要人工確認的位置，涵蓋以下三類情況：(a) ECC 特有依賴項（如 Claude Code 內建 MCP 工具）；(b) Claude Code 專屬 API 呼叫（如 `SubAgent()` 呼叫）；(c) 在 SkillsBuilder `skills/` 目錄中尚無對應的工具參照

4. WHEN ecc-migrator 處理包含 Slash Command 定義的 ECC Skills 時，THE ecc-migrator SHALL 在輸出草稿後附加「跨 IDE 觸發方式」區塊，說明在 Kiro（Trigger Keywords 搜尋）、Claude Code（`/命令名稱`）、Cursor（`@skills/`）三個 IDE 中觸發該技能的方式

5. WHEN `INSTALL.ps1` 執行完整同步後，THE INSTALL.ps1 SHALL 在輸出末尾顯示「ECC 整合狀態摘要」區塊，包含：已整合的 ECC 衍生技能總數（數字）、各語言 Reviewer 的安裝狀態（以 `[已安裝]` 或 `[未找到]` 標示）、各語言 Resolver 的安裝狀態（同上格式）

6. THE ecc-migrator SHALL 在 `skills/dev/ecc-migrator/ecc-compatibility-matrix.md` 中維護一份相容性矩陣，包含兩個表格：「已驗證可遷移的 ECC Skills 清單」（欄位：ECC Skill 名稱、SkillsBuilder 對應技能名稱、驗證日期）、「已知不相容的 ECC Skills 清單」（欄位：ECC Skill 名稱、不相容原因說明）

---

### Requirement 7: Loop Operator 整合

**User Story:** 身為使用 SkillsBuilder 執行長時間自主任務的使用者，我希望系統能自動偵測 Agent 執行迴路中的異常狀態（如無限重試、陷入循環），以便在消耗過多資源前自動介入或通知使用者。

#### Acceptance Criteria

1. THE SkillsBuilder SHALL 在 `skills/dev/` 目錄下新增 `loop-operator` 技能目錄，包含 `SKILL.md`（含 YAML frontmatter `name`、`description`、`Trigger Keywords`、`Prerequisites`）

2. WHEN `loop-operator` 處於啟用狀態且 Agent 正在執行任務，WHILE 相同工具名稱被連續呼叫超過 3 次且每次輸出與前次輸出的差異低於 5%（以字元差異率計算），THE Loop_Operator SHALL 輸出包含「偵測到潛在迴路 — 工具名稱 X 已連續呼叫 N 次，輸出相似度 Y%」的警告訊息，並列出三個介入選項

3. WHEN Loop_Operator 偵測到 Agent 迴路異常並輸出警告時，THE Loop_Operator SHALL 呈現以下三個選項供使用者回應：(a)「強制終止並摘要當前進度」— 中止任務並輸出截至當前已完成步驟的摘要；(b)「調整策略後重新啟動」— 請使用者輸入新策略指令後重新執行；(c)「忽略此次警告繼續執行」— 重設計數器並繼續

4. WHILE `autonomous-executor` 或 `subagent-driven-development` 技能正在執行長任務，THE Loop_Operator SHALL 自動啟用迴路偵測（等同執行選項 (c) 的監控模式），無需使用者額外呼叫 `loop-operator`

5. IF Loop_Operator 在連續 10 分鐘內未收到任何工具呼叫或輸出更新（Agent 呈現靜默狀態），THEN THE Loop_Operator SHALL 輸出「靜默超時警告：已 10 分鐘無活動，是否繼續等待？（輸入 Y 繼續等待 / 輸入 N 終止任務）」，並等待使用者回應

---

### Requirement 8: INSTALL.ps1 與多 IDE 規則同步擴充

**User Story:** 身為維護 SkillsBuilder 的開發者，我希望 ECC 整合產生的新技能與 Hook 配置能自動納入現有的 `INSTALL.ps1` 同步流程，以便使用者不需要學習額外的安裝步驟。

#### Acceptance Criteria

1. WHEN `INSTALL.ps1` 執行時，THE INSTALL.ps1 SHALL 自動掃描 `skills/dev/` 目錄，識別並同步本次整合新增的 15 個技能（`typescript-reviewer`、`python-reviewer`、`go-reviewer`、`rust-reviewer`、`django-reviewer`、`kotlin-reviewer`、`typescript-build-resolver`、`python-build-resolver`、`go-build-resolver`、`rust-build-resolver`、`agent-shield`、`hooks-enhancer`、`harness-optimizer`、`ecc-migrator`、`loop-operator`）至全域技能池（`~/.gemini/antigravity/skills` 或對應路徑）

2. WHEN `INSTALL.ps1` 執行完成時，THE INSTALL.ps1 SHALL 在輸出摘要中顯示獨立的「ECC 整合技能」區塊，格式為每行一個技能：`[已同步] {技能名稱}` 或 `[略過] {技能名稱}（目錄不存在）`，並在區塊末尾顯示「共同步 N / 15 個 ECC 技能」

3. WHEN 使用者在未包含本次新增技能的環境下執行 `INSTALL.ps1` 時，THE INSTALL.ps1 SHALL 以 `[略過]` 標示不存在的技能目錄並繼續同步其他現有技能，輸出的 exit code 為 0，不產生任何錯誤訊息或中止執行

4. WHEN `verify.ps1` 執行時，THE verify.ps1 SHALL 針對所有已存在於 `skills/dev/` 的 ECC 衍生技能目錄，驗證 `SKILL.md` 文件存在且 YAML frontmatter 包含 `name` 與 `description` 欄位，並在現有確效報告的末尾附加「ECC 技能格式驗證」區塊，以 `[通過]` 或 `[失敗: 原因]` 標示每個技能的驗證結果

---

### Requirement 9: 整合文檔與知識庫更新

**User Story:** 身為 SkillsBuilder 使用者或新進開發者，我希望能找到清晰的文件說明 ECC 整合能力的使用方式，以便快速上手並知道在什麼場景下應呼叫哪個新技能。

#### Acceptance Criteria

1. THE SkillsBuilder SHALL 在 `wiki/entities/` 目錄下新增 `ecc-integration.md` 文件，內容包含：ECC 框架的核心概念描述（Skills / Subagents / Hooks / AgentShield 各一段說明）、本次整合的 15 個新技能清單（含各技能的一行說明）

2. THE SkillsBuilder 的 `README.md` SHALL 在「核心能力」章節將技能總數由「42」更新為「57」（42 + 15 個新增技能），並在技能分類表中為每個新增的 ECC 衍生技能新增一行，格式與現有條目一致（技能名稱、觸發方式、一行說明）

3. WHEN 使用者在 `instructions.html` 的搜尋框輸入 ECC 衍生技能的名稱或關鍵詞時，THE instructions.html SHALL 在搜尋結果中顯示對應的技能項目，每個項目包含以下四個欄位：技能名稱（`code` 格式）、類別（`dev`）、觸發方式（文字說明）、適用場景描述（一行說明）

4. THE SkillsBuilder SHALL 在 `docs/` 目錄下新增 `ecc-integration-guide.md`，其中「ECC 能力對應表」章節包含完整的對照表格（欄位：ECC 原始技能名稱、SkillsBuilder 整合技能名稱、差異說明），「AgentShield 啟用指南」章節包含至少一個可直接複製使用的 Hook 配置代碼塊（JSON 格式），「hooks-enhancer 配置教學」章節包含各語言 formatter 的安裝指令與對應的 Hook 配置代碼塊
