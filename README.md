# SkillsBuilder: 全球最大的 AI-Agentic Skill 開源圖書館 (ClawHub All-Star Library)

SkillsBuilder 是一個專為「自動化智慧開發」而設計的元平台。它不僅是打造 AI Agent 技能 (Skills) 的工廠，更是 Antigravity IDE 的**全域智慧來源 (Source of Truth)**，並已全面轉型為 **ClawHub 全明星技能儲備庫**。

本專案融合了 Google 的設計模式、Karpathy 的 Wiki 模式、Superpowers 四大工程紀律原則，以及 Hermes Agent 的閉環學習能力，旨在實現代碼的「外科手術式精準」與知識的「複利式成長」。

---

## 🎯 本專案能做什麼？(核心能力)

### 1. 為 AI 裝備「工業級技能」 (Skill Library)
專案內建了從 ClawHub 與開源社群嚴選的**頂尖 AI 技能庫**（位於 `skills/` 目錄），涵蓋三大類（共 **57 個技能**）：
- **Core (生產力)**：`tavily` (深度研究)、`last30days` (趨勢總結)、`skill-onboarding` (技能喚醒)、`find-skills` (技能探索)、`vetter` (安全審查)、`using-superpowers` (紀律核心)、`youtube`、`summarize`、`planning`、`x-trends`。
- **Dev (開發專用)**：`gitnexus` (代碼圖譜)、`graphify` (低 Token 查詢)、`autoresearch` (閉環 ML)、`autonomous-executor` (Manus Mode)、`tdd-enforcer` (測試驅動)、`grill-requirements` (需求拷問)、`complexity-reduction` (複雜度削減)、`verification-before-completion` (完工驗證)、`soul-evolution` (人格進化)、`skill-creator` (技能建立)、`session-memory` (跨 Session 記憶)、`cron-automations` (排程自動化)、`knowledge-bridge` (知識橋樑)、`subagent-driven-development`、`dispatching-parallel-agents`、`writing-plans`、`executing-plans`、`bug-diagnose`、`spec-architect`、`skill-architect`、`web-coder`、`github-manager`、`requesting-code-review`、`receiving-code-review`、`finishing-a-development-branch`、`using-git-worktrees`、`writing-skills`、`ttypescript-reviewer` (TypeScript 專家審查)、`python-reviewer` (Python 專家審查)、`go-reviewer` (Go 專家審查)、`rust-reviewer` (Rust 專家審查)、`django-reviewer` (Django 專家審查)、`kotlin-reviewer` (Kotlin 專家審查)、`typescript-build-resolver` (TypeScript 編譯問題診斷)、`python-build-resolver` (Python 編譯問題診斷)、`go-build-resolver` (Go 編譯問題診斷)、`rust-build-resolver` (Rust 編譯問題診斷)、`agent-shield` (Agent 安全防護)、`hooks-enhancer` (鉤子系統增強)、`harness-optimizer` (測試框架優化)、`ecc-migrator` (ECC 流程遷移)、`loop-operator` (循環操作優化)。
- **UI (介面設計)**：`glass-effect` (毛玻璃效果設計系統)。

### 2. 「會學習」的專案大腦 (Karpathy LLM Wiki + Hermes 閉環學習)
- **記憶複利**：傳統 AI 的記憶會在對話結束後消失，但 SkillsBuilder 實作了「持久化知識庫 (`wiki/`)」。您與 AI 共同制定過的架構決策、UI 規範（如莫蘭迪色系、SOP流程），都會被寫入 `wiki/` 當中。
- **Hermes 閉環學習**：整合 Nous Research Hermes Agent 的核心理念——代理在完成複雜任務後，能自主建立新技能 (`skill-creator`)、沉澱跨 session 記憶 (`session-memory`)、排程定期維護 (`cron-automations`)，形成真正的自我進化迴路。

### 3. 生產新技能 (Skill Architect)
- 內建 `skill-architect` 技能，您可以直接命令 AI：「幫我寫一個能夠自動化備份資料庫的 Skill」。系統會運用標準化流程（探索-執行-驗證-歸檔）為您自動生成、測試並封裝成一個新技能。

### 4. 專家角色與協作協議 (Agent Personas & NEXUS)
- **專家資源庫**：整合了 `Agency-Agents-ZH` 的 193+ 個專家角色（位於 `raw/external/agency-agents-zh`），涵蓋工程、設計、行銷、法律等領域。
- **NEXUS 協議**：實作了 `wiki/concepts/nexus-protocols.md` 協作標準，確保多智能體任務具備標準化的交接與質量門檻。

---

## 🚀 如何使用本專案？(操作指南)

### 方式一：本機一鍵安裝與環境綁定 (Antigravity & Gemini CLI)
當您在任何電腦上下載本專案後：
1. **執行安裝腳本**：雙擊或在 PowerShell 中執行 `.\INSTALL.ps1`。
2. **它的作用**：這個腳本會建立 **Symbolic Link / Deep Copy 備援**，把本專案 `skills/` 資料夾裡的技能，自動且安全地映射到系統級技能池裡 (`~/.gemini/antigravity/skills`)。本專案目前採用 try-catch 備援，即使無管理員權限也保證 100% 成功。
3. **Gemini CLI 支援**：本專案已支援 `gemini-extension.json`，能被 Gemini CLI 原生載入並透過 `GEMINI.md` 自動在會話啟動時激活 `using-superpowers` 核心紀律引導。

### 方式二：使用「互動式使用手冊與指令指南」(instructions.html)
本專案已內建極具視覺美感的 [instructions.html](file:///c:/Self-developed_Apps/SkillsBuilder/instructions.html)。您可以在瀏覽器中直接開啟它，獲取以下功能：
*   **雙主題切換**：完全符合 HSL 色彩大師規範，支持白天與夜晚模式一鍵切換。
*   **實時檢索過濾**：一鍵過濾 IDE 斜槓命令（如 `/goal`, `/grill-me`）與專案魔術短語。
*   **一鍵複製指令**：提供精緻的微動畫互動反饋。

### 方式三：作為多 IDE 原生插件載入 (Claude Code / Cursor / OpenCode / Codex)
本專案已完美整合 `superpowers` 插件架構，可直接作為原生插件載入：
*   **Claude Code**：在 CLI 中自動加載 `.claude-plugin` 並調用 `hooks/session-start` 鉤子在對話開始時注入環境上下文。
*   **Cursor IDE**：在 Cursor 插件設定中指向本專案，會自動透過 `.cursor-plugin` 與 `hooks/hooks-cursor.json` 加載。
*   **OpenCode.ai**：在 `opencode.json` 的 `plugin` 陣列中新增本專案路徑，會自動運行 `.opencode/plugins/superpowers.js` 自動化引導與技能載入。

---

## 💡 如何應用於新開發專案？

您不需要複製本專案，只需透過以下方式在新專案中繼承智慧：

1. **繼承全域技能**：只要執行過 `INSTALL.ps1`，您在任何新資料夾開發時，我（AI 助理）都能直接調用 `tavily`、`gitnexus` 等工具，無需重複安裝。
2. **初始化智慧環境**：在新專案目錄對我說**「啟動 SkillsBuilder 開發模式」**，我會自動為新專案建立 `DEV_LOG.md` 與 `wiki/` 架構，並載入所有設計規範與 PDCA 流程。
3. **跨專案智慧共享**：您在 SkillsBuilder 中維護的通用規則（如 UI 規範或 SOP），會自動應用到您的所有新專案中，實現開發經驗的「複利成長」。

---

## 📁 專案架構 (MECE 結構)

```text
SkillsBuilder/
├── .claude-plugin/       # Claude Code 原生插件配置
├── .cursor-plugin/       # Cursor IDE 原生插件配置
├── .codex-plugin/        # Codex CLI 原生插件配置
├── .opencode/            # OpenCode.ai 原生插件與安裝手冊
├── .kiro/steering/       # Kiro IDE 自動引導規則
├── .github/              # GitHub Actions (Pages 自動部署)
├── hooks/                # 跨平台 Shell 鉤子 (SessionStart 上下文注入)
├── wiki/                 # 專案大腦：合成知識庫 (Karpathy Pattern)
│   ├── entities/         # 工具與系統實體（Hermes、Graphify、GitNexus 等）
│   └── concepts/         # 設計模式與開發哲學
├── skills/               # 技能目錄（60 個工業級技能）
│   ├── core/             # 生產力技能（10 個）
│   ├── dev/              # 開發技能（49 個）
│   └── ui/               # UI 設計技能（1 個）
├── raw/                  # 原始素材：不可變的文檔與參考資料
│   └── external/         # Git Submodule（Agency-Agents-ZH 193+ 專家角色）
├── docs/                 # ��發標準文檔（Karpathy 準則、工作流鉤子）
├── tools/                # Python 工具集（RTK 高信號讀取、知識橋樑）
├── DEV_LOG.md            # 開發日誌：PDCA 執行紀錄與 RCA/CAPA 歸檔
├── index.html            # 專案主門面：嚴選技能庫與大腦地圖
├── instructions.html     # 可互動的使用說明與指令指南 (HSL 色彩大師規範)
├── package.json          # npm / OpenCode 模組配置
├── gemini-extension.json # Gemini CLI 插件描述檔
├── GEMINI.md             # Gemini CLI 自動引導索引
├── INSTALL.ps1           # 一鍵安裝：同步 skills 至全域池 + 確效
├── verify.ps1            # 軟體確效腳本：LINT + 同步完整性檢查
└── README.md             # 本手冊
```

---

## 💎 設計總監規範 (Digital Art Director)

本專案的所有介面優化與文檔產出皆遵循 **Color Master Palette**：
- **深色模式 (Base)**：`#0F172A` (Slate 900)
- **品牌色 (Accent)**：`#60A5FA` (Sky Blue)
- **文字 (Primary)**：`#F1F5F9` (Slate 100)

## 📜 許可證
MIT License
> [!WARNING]
> **�~���l�ҲջP�ޯ��X�R�W�d**
> �ФŤ�ʱN�~���M�ס]�Ҧp ddyosmani/agent-skills �Τj���ҪO�M�ס^���ɮת��������Y�νƻs�� skills/ �ؿ����U�C
> skills/ �ؿ��Y����` skills/<����>/<�ޯ�W��> �� MECE �[�c�C����~���l�Ҳ������U�� aw/ ��Ƨ��U�A�å�� INSTALL.ps1 �}���۰ʶi��ʺA�ѪR�P�����C�N�ɮת����ɦL�� skills/ �ڥؿ��N�ɭP Git �l�ܱY��P�w�˸}���ѪR���ѡC
