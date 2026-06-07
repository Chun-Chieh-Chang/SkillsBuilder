# SkillsBuilder ECC 整合指南

本指南說明如何使用 SkillsBuilder 整合 ECC（Everything Claude Code）框架的核心能力。本次整合新增了 15 個語言專屬審查器（Reviewer）、編譯問題診斷器（Resolver）以及安全與效能優化工具。

---

## ECC 能力對應表

| ECC 原始技能名稱 | SkillsBuilder 整合技能名稱 | 差異說明 |
|----------------|------------------------|---------|
| typescript-reviewer | typescript-reviewer | 功能一致：結合 tsc、eslint 進行 TypeScript 專家審查 |
| python-reviewer | python-reviewer | 功能一致：結合 mypy、pylint 進行 Python 專家審查 |
| go-reviewer | go-reviewer | 功能一致：結合 gofmt、go vet 進行 Go 專家審查 |
| rust-reviewer | rust-reviewer | 功能一致：結合 rustc、clippy 進行 Rust 專家審查 |
| django-reviewer | django-reviewer | 功能一致：結合 flake8、django-lint 進行 Django 專家審查 |
| kotlin-reviewer | kotlin-reviewer | 功能一致：結合 kotlinc、detekt 進行 Kotlin 專家審查 |
| typescript-build-resolver | typescript-build-resolver | 功能一致：自動診斷與修復 TypeScript 編譯錯誤與依賴衝突 |
| python-build-resolver | python-build-resolver | 功能一致：自動診斷與修復 Python 套件安裝錯誤與依賴衝突 |
| go-build-resolver | go-build-resolver | 功能一致：自動診斷與修復 Go 模組下載錯誤與模組衝突 |
| rust-build-resolver | rust-build-resolver | 功能一致：自動診斷與修復 Rust 套件下載錯誤與套件衝突 |
| agent-shield | agent-shield | 功能一致：git push 前自動執行多層安全掃描（硬編碼秘鑰、動態執行、依賴漏洞、注入風險） |
| hooks-enhancer | hooks-enhancer | 功能一致：生成 IDE 特定的 Hook 配置（格式化、型別檢查、除錯語句偵測、import 驗證） |
| harness-optimizer | harness-optimizer | 功能一致：管理 Context Window 使用量並估算 token 成本 |
| ecc-migrator | ecc-migrator | 功能一致：將 ECC Workflow Skills 格式轉換為 SkillsBuilder Skill 格式 |
| loop-operator | loop-operator | 功能一致：監控 Agent 執行迴路、偵測異常並介入 |

---

## AgentShield 啟用指南

AgentShield 是 SkillsBuilder 的安全掃描子系統，於 git push 前自動執行多層安全審查，攔截高風險安全問題。

### 一鍵啟用（推薦）

執行 INSTALL.ps1 腳本，系統會自動配置 AgentShield Hook：

```powershell
powershell -ExecutionPolicy Bypass -File INSTALL.ps1
```

### 手動配置 Hook

#### Kiro Hook 範例 (.kiro/hooks/pre-git-push.json)

```json
{
  "id": "agent-shield-git-push",
  "description": "ECC AgentShield Security Scan Before Git Push",
  "eventType": "preToolUse",
  "hookAction": "askAgent",
  "outputPrompt": "請執行 AgentShield 安全掃描：\n1. 硬編碼秘鑰（API Key、密碼、Token）\n2. eval()/exec() 動態執行指令\n3. 相依套件的已知高風險版本（CVE）\n4. SQL 與 Shell 注入風險模式\n\n請針對本次 commit 的 staged 文件執行掃描，輸出結構化報告。",
  "toolTypes": "git"
}
```

#### Claude Code Hook 範例 (.claude/settings.json)

```json
{
  "hooks": [
    {
      "id": "agent-shield-git-push",
      "trigger": "preToolUse",
      "handler": {
        "type": "askAgent",
        "prompt": "請執行 AgentShield 安全掃描：\n1. 硬編碼秘鑰（API Key、密碼、Token）\n2. eval()/exec() 動態執行指令\n3. 相依套件的已知高風險版本（CVE）\n4. SQL 與 Shell 注入風險模式\n\n請針對本次 commit 的 staged 文件執行掃描，輸出結構化報告。"
      }
    }
  ]
}
```

#### Cursor Hook 範例 (hooks/hooks-cursor.json)

```json
{
  "hooks": [
    {
      "id": "agent-shield-git-push",
      "trigger": "preToolUse",
      "action": {
        "type": "askAgent",
        "outputPrompt": "請執行 AgentShield 安全掃描：\n1. 硬編碼秘鑰（API Key、密碼、Token）\n2. eval()/exec() 動態執行指令\n3. 相依套件的已知高風險版本（CVE）\n4. SQL 與 Shell 注入風險模式\n\n請針對本次 commit 的 staged 文件執行掃描，輸出結構化報告。"
      }
    }
  ]
}
```

---

## hooks-enhancer 配置教學

hooks-enhancer 會根據您選擇的 IDE 生成對應的 Hook 配置文件，包含四種自動化品質檢查範本：

### 1. Prettier (JavaScript/TypeScript) - Formatter 安裝

**安裝指令：**
```bash
npm install --save-dev prettier
```

**Hook 配置：**
```json
{
  "id": "auto-formatter-prettier",
  "trigger": "fileEdited",
  "hookAction": "runCommand",
  "command": "npx prettier --write {file}"
}
```

### 2. Black (Python) - Formatter 安裝

**安裝指令：**
```bash
pip install black
```

**Hook 配置：**
```json
{
  "id": "auto-formatter-black",
  "trigger": "fileEdited",
  "hookAction": "runCommand",
  "command": "black {file}"
}
```

### 3. gofmt (Go) - Formatter 安裝

**安裝指令：**
```bash
go install golang.org/x/tools/cmd/goimports@latest
```

**Hook 配置：**
```json
{
  "id": "auto-formatter-gofmt",
  "trigger": "fileEdited",
  "hookAction": "runCommand",
  "command": "gofmt -w {file}"
}
```

### 4. TypeScript 型別檢查

**安裝指令：**
```bash
npm install --save-dev typescript
```

**Hook 配置：**
```json
{
  "id": "tsc-type-check",
  "trigger": "fileEdited",
  "hookAction": "runCommand",
  "command": "npx tsc --noEmit",
  "timeout": 60
}
```

### 5. Console.log / Print 偵測器

**Hook 配置：**
```json
{
  "id": "console-log-detector",
  "trigger": "fileEdited",
  "hookAction": "askAgent",
  "outputPrompt": "請偵測以下代碼中殘留的 console.log / print 除錯語句，標示所在行號：\n\n{file_content}"
}
```

### 6. Import 路徑驗證器

**Hook 配置：**
```json
{
  "id": "import-validator",
  "trigger": "fileEdited",
  "hookAction": "askAgent",
  "outputPrompt": "請識別以下代碼中無法解析的 import 路徑或 package.json/requirements.txt 中未宣告的依賴：\n\n{file_content}"
}
```

---

## 新增技能總覽

本次 ECC 整合共新增 15 個技能至 skills/dev/ 目錄：

### 語言專屬審查器（6 個）
1. typescript-reviewer - TypeScript 專家審查（tsc + eslint）
2. python-reviewer - Python 專家審查（mypy + pylint）
3. go-reviewer - Go 專家審查（gofmt + go vet）
4. rust-reviewer - Rust 專家審查（rustc + clippy）
5. django-reviewer - Django 專家審查（flake8 + django-lint）
6. kotlin-reviewer - Kotlin 專家審查（kotlinc + detekt）

### 語言專屬編譯問題診斷器（4 個）
7. typescript-build-resolver - TypeScript 編譯錯誤診斷與修復
8. python-build-resolver - Python 套件安裝錯誤診斷與修復
9. go-build-resolver - Go 模組錯誤診斷與修復
10. rust-build-resolver - Rust 套件錯誤診斷與修復

### 安全與效能工具（5 個）
11. agent-shield - Git Push 前自動安全掃描
12. hooks-enhancer - IDE Hook 配置生成器
13. harness-optimizer - Context Window 與 Token 成本管理
14. ecc-migrator - ECC Skills 格式轉換工具
15. loop-operator - Agent 執行迴路異常監控與介入

---

## 驗證安裝狀態

執行 verify.ps1 腳本驗證所有 ECC 技能格式：

```powershell
powershell -ExecutionPolicy Bypass -File verify.ps1
```

輸出應包含「ECC 技能格式驗證」區塊，標示每個技能的驗證結果（[通過] 或 [失敗: 原因]）。

---

版本: 2026-01-15  
維護者: SkillsBuilder Core Team
