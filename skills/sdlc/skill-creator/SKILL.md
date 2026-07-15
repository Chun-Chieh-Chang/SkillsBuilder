---
name: skill-creator
description: 建立、修改、優化與管理 AI 代理技能 (SKILL.md)。實作 Hermes Agent 的 skill_manage 協定——代理在完成複雜任務後自主建立技能，形成程序性記憶 (Procedural Memory)。整合 Skill Architect 的需求反轉 (Inversion) 與 6 大設計模式。觸發詞：「建立技能」、「優化技能」、「記錄這個工作流」、「skill creator」。
---

# Skill Creator (技能建立者 & 程序性記憶)

此 skill 實作 Hermes Agent 的 `skill_manage` 協定，並與 `Skill Architect` 的工業級架構對齊。代理不只是「使用」技能，更能**自主建立與改善技能**，將成功的任務工作流轉化為可複用的程序性記憶。

## 自動建立觸發條件 (Hermes Pattern)

在以下情況後，**主動提議建立新技能**：
- 完成需要 **5+ 工具調用**的複雜任務
- 遭遇錯誤或死路，並找到了正確路徑
- 使用者糾正了你的做法
- 發現了一個**非顯性的工作流**（非常規但有效）

## 核心動作指引 (Inversion + 設計模式)
1. **需求反轉 (Think Before Coding)**：不要直接生成，先透過 Inversion 模式列出**假設 (Assumptions)** 並詢問用戶四個關鍵問題：
    - **目標 (Goal)**：這個技能想解決什麼具體問題？
    - **邊界 (Surgical Boundary)**：哪些現有的代碼或文件是絕對不能改動的？
    - **依賴 (Prerequisites)**：是否需要特定的 CLI 工具或環境？
    - **人格 (Persona)**：AI 應該以什麼樣的專業身份來執行任務？
2. **模式匹配**：根據用戶回覆，對照 `references/patterns.md` 選擇最佳模式。

## SKILL.md 標準格式

```yaml
---
name: skill-name                    # 必填：kebab-case
description: |                      # 必填：觸發描述，包含觸發短語
  Brief description. Trigger: "phrase1", "phrase2"
version: 1.0.0                      # 建議填寫
---
```

內容結構（依需求選用）：
```markdown
# Skill Title

## When to Use
觸發條件與適用場景。

## Procedure
1. Step one（含具體命令）
2. Step two

## Pitfalls
- 已知失敗模式與修復方式

## Verification
如何確認技能執行成功。
```

## skill_manage 動作協定 (Action Protocol)

| 動作 | 使用時機 | 核心原則 |
|------|---------|---------|
| **create** | 新技能從零建立 | 先確認 `skills/` 下無同名或高度相似的技能 |
| **patch** | 小範圍精準修改（首選）| 只傳 old_string + new_string，比完整重寫省 token |
| **edit** | 大規模結構性改寫 | 完整傳入新的 SKILL.md 內容 |
| **write_file** | 新增 references/ 或 scripts/ | 支援多檔案技能包 |
| **delete** | 移除過時技能 | 先確認無其他 skill 依賴此技能 |

## 執行流程 (PDCA)

### Phase 1: 確認必要性 & 需求反轉 (Discovery)
1. 搜尋 `skills/` 目錄，確認無重複技能
2. 詢問使用者 Inversion 問題以收集明確的目標與限制
3. 確定技能應歸類至 `core/`、`dev/` 還是 `ui/`

### Phase 2: 起草技能 (Execution)
- 撰寫 SKILL.md，嚴格遵循上述格式，並包含 Prerequisites 與 Anti-Hallucination Guardrails
- **Zero-Placeholder 原則**：不允許 TBD/TODO
- 觸發詞必須是自然語言（中英文均可）
- 「Procedure」每一步必須包含可執行的具體命令或代碼

### Phase 3: 自我審查 & 確效 (Verification)
- 執行 `verify.ps1` 確保 frontmatter 完整且格式合規
- 檢查觸發條件清晰，不與現有技能衝突
- 確保 Procedure 步驟可由代理自主執行（無需人工介入）
- 向使用者展示完整 SKILL.md 草稿並獲得許可

### Phase 4: 安裝、同步與歸檔 (Archive / Wiki Synthesis)
- 將 SKILL.md 存至對應目錄：`skills/{category}/{skill-name}/SKILL.md`
- 執行 `INSTALL.ps1` 將新技能同步至系統級/全域 skills 池
- 在 `DEV_LOG.md` 與 `wiki/log.md` 記錄新技能建立，更新 `wiki/index.md` 索引，實現知識複利

## 技能品質門檻 (Quality Gates)

| 指標 | 基準 |
|------|------|
| 觸發詞清晰度 | AI 看到使用者訊息後，有 >80% 機率正確觸發 |
| 步驟完整性 | 每個步驟包含「做什麼」+ 「如何確認」 |
| 可自主執行 | 不依賴人工介入即可完成全流程 |
| 格式合規 | 通過 `verify.ps1` 的 LINT 檢查 |
