# SkillsBuilder: 全球最大的 AI-Agentic Skill 開源圖書館 (ClawHub All-Star Library)

SkillsBuilder 是一個專為「自動化智慧開發」而設計的元平台。它不僅是打造 AI Agent 技能 (Skills) 的工廠，更是 Antigravity IDE 的**全域智慧來源 (Source of Truth)**，並已全面轉型為 **ClawHub 全明星技能儲備庫**。

本專案融合了 Google 的設計模式、Karpathy 的 Wiki 模式與 Hermes 的代理能力，旨在實現代碼的「外科手術式精準」與知識的「複利式成長」。

---

## 🎯 本專案能做什麼？(核心能力)

### 1. 為 AI 裝備「工業級技能」 (Skill Library)
專案內建了從 ClawHub 與開源社群嚴選的**頂尖 AI 技能庫**（位於 `skills/` 目錄），涵蓋兩大類：
- **Core (生產力)**：例如 `tavily` (深度研究)、`last30days` (趨勢總結)、`skill-onboarding` (技能喚醒)、`find-skills` (技能探索與安裝)、`vetter` (安全審查)。
- **Dev (開發專用)**：例如 `gitnexus` (代碼圖譜)、`graphify` (本機圖譜與低 Token 查詢)、`autoresearch` (閉環自主 ML 研究)、`github-manager` (自動化管理)、`web-coder` (前端開發)、`skill-architect` (技能建築)。
當這些技能被掛載後，AI 就能直接調用這些外部工具來幫您完成複雜任務。

### 2. 「會學習」的專案大腦 (Karpathy LLM Wiki 模式)
- **記憶複利**：傳統 AI 的記憶會在對話結束後消失，但 SkillsBuilder 實作了「持久化知識庫 (`wiki/`)」。您與 AI 共同制定過的架構決策、UI 規範（如莫蘭迪色系、SOP流程），都會被寫入 `wiki/` 當中。下次開新對話或新專案時，AI 只要讀取這裡的資料，就能立刻繼承過去的「開發智慧」，不需重新教導。

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
├── hooks/                # 跨平台 Shell 鉤子 (SessionStart 上下文注入)
├── wiki/                 # 專案大腦：合成知識庫 (Karpathy Pattern)
├── skills/               # 技能目錄：包含 core (生產力) 與 dev (開發) 技能
│   ├── core/             # 生產力技能：新增 using-superpowers (超能力核心) 等
│   └── dev/              # 開發技能：新增 subagent-driven-development, executing-plans 等
├── raw/                  # 原始素材：不可變的文檔與參考資料
├── DEV_LOG.md            # 開發日誌：PDCA 執行紀錄與 RCA/CAPA 歸檔
├── index.html            # 專案主門面：嚴選技能庫與大腦地圖
├── instructions.html     # 可互動的使用說明與指令指南 (HSL 色彩大師規範)
├── package.json          # npm / OpenCode 模組配置
├── gemini-extension.json # Gemini CLI 插件描述檔
├── GEMINI.md             # Gemini CLI 自動引導索引
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
