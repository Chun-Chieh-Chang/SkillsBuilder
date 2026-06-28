# 全域 IDE 工具規則整合指南 (Global IDE Integration Guide)

> **Last Updated**: 2026-06-28
> **Scope**: 跨 IDE 核心規則對齊 (Cursor, Claude Code, Cline, Roo Code, Copilot, Continue, Zed, etc.)

---

## 1. 核心整合原理

SkillsBuilder 採用 **「單一事實來源 (Single Source of Truth)」** 與 **「DevOS 邊車架構 (Sidecar Architecture)」**。所有的 IDE 工具規則皆以 [`CLAUDE.md`](file:///f:/Self-developed_Apps/SkillsBuilder/CLAUDE.md) 為根源。

依據運行環境，整合分為兩種路徑：

```
[本機開發專案] 
      │ 
      ├─── 專案層級 (Sidecar 邊車) ───► 一鍵 Bootstrap 複製 13 個 IDE 規則 (專案級防禦)
      │ 
      └─── 全域層級 (Global Config) ──► 寫入各 IDE 全域設定 (如 ~/.gemini, Cursor AI Rules)
```

---

## 2. 專案層級：一鍵邊車部署 (推薦)

由於現代 IDE AI 助手（如 Cursor、Roo Code、Cline）高度依賴 **「專案工作區路徑 (Workspace-scoped)」** 下的規則檔，因此最安全、最有效率的整合方式是**在每個本機開發專案的工作區根目錄下執行一鍵 Bootstrap 命令**。

### 執行指令：
```powershell
powershell -ExecutionPolicy Bypass -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; iex ((New-Object Net.WebClient).DownloadString('https://raw.githubusercontent.com/Chun-Chieh-Chang/SkillsBuilder/main/bootstrap.ps1'))"
```

### 邊車運作效果：
1. 自動偵測本機 `~/.gemini/` 底下的 SkillsBuilder 安裝路徑。
2. 在當前專案中建立/更新 13 個 IDE 規則檔（如 `.cursorrules`、`.clinerules`、`CLAUDE.md`、`GEMINI.md` 等）。
3. 自動在規則中注入「邊車指引 (Sidecar Pointer)」與 **1% 規則**，強制 AI 助手在符合條件時自動呼叫全域 Skill 庫中的能力。

---

## 3. 全域層級：將規則整合至 IDE 全域設定

若希望在「沒有執行邊車部署」的任意資料夾中，IDE 的 AI 助手也能預設遵守 SkillsBuilder 規則，請依下列工具設定全域配置：

### 3.1 Cursor 全域系統提示 (AI Rules)
1. 開啟 Cursor -> **Settings (右上角齒輪)** -> **Features** -> **Rules for AI**。
2. 複製 [`CLAUDE.md`](file:///f:/Self-developed_Apps/SkillsBuilder/CLAUDE.md) 的核心守則貼入。
3. 此時，任何在 Cursor 中建立的新會話都將預設載入 **YAGNI Ladder** 與 **Color Master Palette**。

### 3.2 VS Code + GitHub Copilot Chat 全域指令
GitHub Copilot 支援指定全域程式碼生成指令檔：
1. 打開 VS Code 設定 (`Ctrl + ,`)。
2. 搜尋 `github.copilot.chat.codeGeneration.instructions`。
3. 將其設定為指向本機 SkillsBuilder 的 [`CLAUDE.md`](file:///f:/Self-developed_Apps/SkillsBuilder/CLAUDE.md) 路徑：
   ```json
   "github.copilot.chat.codeGeneration.instructions": [
     {
       "path": "F:/Self-developed_Apps/SkillsBuilder/CLAUDE.md"
     }
   ]
   ```

### 3.3 VS Code + Continue 擴充套件全域系統提示
Continue 支援全域系統提示：
1. 編輯 `~/.continue/config.json` 檔案。
2. 在 `models` 或 `systemPrompt` 中，加入/引用規則內容：
   ```json
   {
     "systemPrompt": "You are a Senior Full-stack Architect & Digital Art Director. Always adhere to the SkillsBuilder rules (YAGNI Ladder pre-check, 4px grid spacing, Color Master Palette, and PDCA SOP)."
   }
   ```

### 3.4 Cline / Roo Code / Roo Cline 全域系統指示
Cline 與 Roo Code 預設讀取工作區的 `.clinerules`。為了全域載入，可利用自訂系統提示：
1. 在 Roo Code 設定中，將 System Prompt Rule 設為指向 `F:/Self-developed_Apps/SkillsBuilder/CLAUDE.md`。

---

## 4. 全域 Skill 庫的自動聯動機制

當 IDE 的全域規則載入後，AI Agent 就會遵守 **1% 規則 (The 1% Rule)**：

> **1% 規則**：只要當前任務有 1% 的機率與 `skills/` 目錄下的技能相關，AI Agent 就必須優先使用該 Skill 的專屬指令與 SOP。

此時 AI Agent 會透過本機的 **MCP (Model Context Protocol)** 橋接器，呼叫已註冊在 `~/.gemini/antigravity/skills/` 底下的所有專業技能（如 `addy-spec-driven-dev`、`complexity-reduction` 等），實現跨專案的能力複用。
