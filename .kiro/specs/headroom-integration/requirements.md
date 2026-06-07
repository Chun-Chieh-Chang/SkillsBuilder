# Requirements Document

## Introduction

本功能旨在將 [Headroom](https://github.com/chopratejas/headroom) 整合至 SkillsBuilder 專案。Headroom 是一個自動管理瀏覽器標籤的工具，能識別並關閉不活躍的標籤以節省系統資源（記憶體、CPU、電池）並維持工作環境整潔。SkillsBuilder 將透過整合 Headroom 的 API 與標籤管理能力，建立 headroom-related skills 在 `skills/dev/` 目錄，並提供完整的標籤同步、搜尋、過濾與自動管理功能。

整合目標包括：
1. 將 Headroom 的標籤管理能力引入 SkillsBuilder
2. 建立 headroom-related skills 在 `skills/dev/` 目錄
3. 支援 Headroom 的 API 與本地標籤同步
4. 當使用者開啟瀏覽器時自動同步 Headroom 標籤
5. 在 SkillsBuilder 中可以管理和操作 Headroom 標籤

---

## Glossary

- **SkillsBuilder**：本專案，一個 AI Agent Skill 元平台，支援 13 個 IDE 的 rules 同步
- **Headroom**：瀏覽器標籤自動管理工具，能根據活躍度、使用頻率、分組規則自動關閉不活躍標籤
- **Headroom_API**：Headroom 提供的 REST API，用於查詢、過濾、關閉標籤，以及管理同步設定
- **Active_Tab**：最近 5 分鐘內有互動（焦點、點擊、輸入）的瀏覽器標籤
- **Inactive_Tab**：超過 15 分鐘未互動的瀏覽器標籤，可能符合 Headroom 關閉條件
- **Tab_Group**： Headroom 的標籤分組機制，可按主題、專案、來源對標籤分類
- **Auto_Close_Rule**：Headroom 的關閉策略，包含活躍時間門檻、使用頻率、分組優先級等參數
- **Sync_Engine**：SkillsBuilder 內建的標籤同步模組，負責與 Headroom API 通訊並快取標籤狀態
- **Skill**：SkillsBuilder 中的最小技能單元，以目錄形式存放於 `skills/{category}/{skill-name}/`
- **INSTALL.ps1**：SkillsBuilder 一鍵同步腳本，將 `skills/` 目錄連結至全域技能池
- **verify.ps1**：SkillsBuilder 確效腳本，執行 LINT 與同步完整性檢查

---

## Requirements

### Requirement 1: Headroom 標籤同步技能

**User Story:** 身為 SkillsBuilder 使用者，我希望能將 Headroom 管理的瀏覽器標籤同步至本地快取，以便離線查詢標籤狀態或在多裝置間切換時不遺失工作進度。

#### Acceptance Criteria

1. WHEN 使用者呼叫 `headroom-sync` 技能時，THE Sync_Engine SHALL 透過 Headroom_API 擷取所有標籤的完整清單（包含標籤 ID、標題、URL、最後互動時間、所屬分組、活躍狀態），並儲存至 `skills/dev/headroom-sync/.data/` 目錄下的 `tabs.json`

2. WHEN Sync_Engine 擷取標籤清單成功時，THE Sync_Engine SHALL 輸出包含以下欄位的摘要報告：「已同步標籤數」（數字）、「最後同步時間」（ISO 8601 格式）、「活躍標籤數」（數字）、「待關閉標籤數」（符合 Auto_Close_Rule 的Inactive_Tab 數量）

3. WHEN Sync_Engine 擷取標籤清單時，WHILE  Headroom_API 回傳 HTTP 狀態碼 429（Rate Limited），THE Sync_Engine SHALL 每 30 秒重試一次，最多重試 5 次，並在每次重試前輸出「Rate Limited，等待中（剩餘重試次數：N）」

4. IF Headroom_API 逾時（超過 30 秒無回應）或 HTTP 狀態碼為 5xx（Server Error），THEN THE Sync_Engine SHALL 輸出「Headroom_API 無法存取」錯誤訊息，並列出可能的修復步驟（檢查 Headroom 服務狀態、API Key 是否有效、網路連線）

5. WHERE 使用者已在 Headroom 設定「自動同步至雲端」（cloud-sync: true），THE Sync_Engine SHALL 在同步前先執行 Headroom_API 的 `/sync/pull` 端點，確保本地與雲端標籤狀態一致

6. WHEN `INSTALL.ps1` 執行完成時，THE INSTALL.ps1 SHALL 在輸出摘要中包含 `headroom-sync` 的狀態報告，以 `[可用]`（Headroom_API 可達）或 `[不可用]`（Headroom_API 不可達）標示同步服務當前狀態

---

### Requirement 2: Headroom API 整合技能

**User Story:** 身為開發者，我希望在 SkillsBuilder 中直接呼叫 Headroom_API 進行標籤操作（關閉、分組、標記），以便不需要切換至瀏覽器即可完成日常標籤管理。

#### Acceptance Criteria

1. THE SkillsBuilder SHALL 在 `skills/dev/` 目錄下新增 `headroom-api` 技能目錄，包含 `SKILL.md`（含 YAML frontmatter 欄位 `name`、`description`、`Trigger Keywords`、`Prerequisites`）及 `api-reference.md` 文件

2. WHEN 使用者呼叫 `headroom-api` 並提供 `action: close` 參數時，THE Headroom_API SHALL 根據 `tab_ids`（字串陣列）或 `group`（字串）參數，對應的標籤發送關閉請求，並在回應中包含「已關閉標籤數」（數字）與「失敗標籤 ID 清單」（若有）

3. WHEN 使用者呼叫 `headroom-api` 並提供 `action: group` 參數時，THE Headroom_API SHALL 將指定標籤移動至目標分組（`target_group` 參數），並在回應中包含「已移動標籤數」（數字）與「目標分組名稱」

4. WHEN 使用者呼叫 `headroom-api` 並提供 `action: tag` 參數時，THE Headroom_API SHALL 為指定標籤新增或移除標籤（`tags` 參數為字串陣列），並在回應中包含「已更新標籤數」（數字）與「標籤操作類型」（add/remove）

5. IF 使用者提供的 API 參數缺少必要欄位（如 action 為 close 但未提供 tab_ids 或 group），THEN THE Headroom_API SHALL 輸出「參數驗證失敗」錯誤訊息，並列出缺少的必要欄位與格式範例

6. WHEN Headroom_API 回傳非 2xx HTTP 狀態碼時，THEN THE Headroom_API SHALL 輸出「API 請求失敗」錯誤訊息，包含 HTTP 狀態碼、錯誤類型（client_error/server_error）、與具體錯誤描述

7. THE SkillsBuilder SHALL 在 `skills/dev/headroom-api/api-reference.md` 中維護 Headroom_API 的完整端點清單（`/tabs`, `/tabs/close`, `/groups`, `/sync/pull`）與對應的參數範例

---

### Requirement 3: 自動標籤管理技能

**User Story:** 身為追求高效工作的使用者，我希望 SkillsBuilder 能根據 Headroom 的 Auto_Close_Rule 自動關閉不活躍標籤，以便維持瀏覽器效能與工作環境整潔，無需手動執行同步與關閉流程。

#### Acceptance Criteria

1. THE SkillsBuilder SHALL 在 `skills/dev/` 目錄下新增 `headroom-auto-close` 技能目錄，包含 `SKILL.md`（含 YAML frontmatter 欄位）及 `auto-close-rules.md` 預設規則配置文件

2. WHEN 使用者呼叫 `headroom-auto-close` 技能時，THE Auto_Close_Rule Engine SHALL 依序執行：(a) 呼叫 `headroom-sync` 更新標籤狀態；(b) 根據 `auto-close-rules.md` 中的設定（活躍時間門檻：15 分鐘、最低使用頻率：每小時 1 次、分組優先級：低）篩選出待關閉標籤；(c) 呼叫 Headroom_API `/tabs/close` 端點關閉這些標籤

3. WHEN Auto_Close_Rule Engine 關閉標籤成功時，THE Auto_Close_Rule Engine SHALL 輸出包含以下欄位的摘要報告：「待關閉標籤數」（篩選結果）、「已關閉標籤數」（實際執行結果）、「保留標籤原因清單」（如：標籤已關閉、標籤屬於高優先級分組）

4. WHERE 使用者已在 `auto-close-rules.md` 中設定 `save_private_tabs: true`，THE Auto_Close_Rule Engine SHALL 在篩選待關閉標籤時，排除所有標題包含 `private` 或 `secret` 的標籤（不區分大小寫）

5. WHEN 使用者執行 `headroom-auto-close` 的同時正在執行其他技能（如 `headroom-sync`），THE Auto_Close_Rule Engine SHALL 使用排他鎖機制（`skills/dev/headroom-auto-close/.lock` 檔案），避免同時執行多個 Headroom 操作造成資源競爭

6. IF `auto-close-rules.md` 不存在或格式錯誤（如 JSON 無法解析），THEN THE Auto_Close_Rule Engine SHALL 使用內建預設規則（活躍時間門檻：15 分鐘、最低使用頻率：每小時 1 次、分組優先級：中），並在輸出開頭標示「使用預設規則」

---

### Requirement 4: 標籤搜尋與過濾技能

**User Story:** 身為多標籤使用者，我希望能根據標題、URL、分組、最後互動時間等條件搜尋與過濾 Headroom 標籤，以便快速找到特定工作上下文或清理不需要的標籤。

#### Acceptance Criteria

1. THE SkillsBuilder SHALL 在 `skills/dev/` 目錄下新增 `headroom-search` 技能目錄，包含 `SKILL.md`（含 YAML frontmatter 欄位）

2. WHEN 使用者呼叫 `headroom-search` 並提供 `keyword` 參數時，THE Search_Engine SHALL 在本地快取 `tabs.json` 中搜尋標題或 URL 包含關鍵字的標籤（不區分大小寫），並輸出包含「搜尋結果數」與「前 N 筆標題清單」的報告（N 為 10，可由 `limit` 參數調整）

3. WHEN 使用者呼叫 `headroom-search` 並提供 `group` 參數時，THE Search_Engine SHALL 過濾出所屬分組為 `target_group` 的所有標籤，並按最後互動時間降序排列（最近互動在前）

4. WHEN 使用者呼叫 `headroom-search` 並提供 `state` 參數（值為 `active` 或 `inactive`）時，THE Search_Engine SHALL 過濾出狀態符合的標籤，並輸出「活躍標籤數」與「待關閉標籤數」的統計摘要

5. WHEN 使用者呼叫 `headroom-search` 並同時提供 `keyword` 與 `group` 參數時，THE Search_Engine SHALL 執行邏輯 AND 搜尋，僅回傳同時符合關鍵字與分組條件的標籤

6. IF 本地快取 `tabs.json` 不存在或已過期（超過 30 分鐘未更新），THEN THE Search_Engine SHALL 自動觸發 `headroom-sync` 更新快取，並在輸出開頭標示「已更新快取」

---

### Requirement 5: Headroom-Sync 技能 - 本地標籤管理

**User Story:** 身為離線工作者，我希望即使在沒有 Headroom_API 連線時，也能查看與管理已同步的本地標籤資料，以便在航班或無網路環境下持續工作。

#### Acceptance Criteria

1. WHERE 使用者執行 `headroom-sync` 但 Headroom_API 無法存取時，THE Sync_Engine SHALL 使用最後一次成功同步的 `tabs.json`（若存在且未超過 24 小時），並在輸出開頭標示「使用本地快取（最後同步：ISO 8601）」

2. WHEN 使用者呼叫 `headroom-local-edit` 技能並提供 `action: update` 參數時，THE Local_Tab_Editor SHALL 更新 `tabs.json` 中指定標籤的標題或分組（透過 `tab_id` 與 `new_title` 或 `new_group` 參數），並在回應中包含「已更新標籤 ID」與「變更前後對比」

3. WHEN 使用者呼叫 `headroom-local-edit` 並提供 `action: delete` 參數時，THE Local_Tab_Editor SHALL 從 `tabs.json` 中移除指定標籤（`tab_id`），並在回應中包含「已刪除標籤數」與「剩餘標籤總數」

4. IF 使用者提供的 `tab_id` 不存在於 `tabs.json` 中，THEN THE Local_Tab_Editor SHALL 輸出「標籤 ID 不存在」錯誤訊息，並列出本地快取中所有可用的標籤 ID 清單

5. WHEN 使用者執行 `headroom-local-edit` 並完成變更時，THE Local_Tab_Editor SHALL 自動產生 `tabs.json.patch` 差異檔案，記錄變更內容與時間戳記，以便日後 Headroom_API 恢復連線時可選擇合併變更

6. WHERE 使用者已在 `skills/dev/headroom-local-edit/.config.json` 中設定 `auto-sync-on-close: true`，THE Local_Tab_Editor SHALL 在技能執行完成時自動觸發 `headroom-sync`，嘗試將本地變更同步至 Headroom_API

---

### Requirement 6: INSTALL.ps1 與 verify.ps1 更新

**User Story:** 身為維護 SkillsBuilder 的開發者，我希望 Headroom 整合產生的新技能能自動納入現有的 `INSTALL.ps1` 同步流程，並透過 `verify.ps1` 確保技能格式正確。

#### Acceptance Criteria

1. WHEN `INSTALL.ps1` 執行時，THE INSTALL.ps1 SHALL 自動掃描 `skills/dev/` 目錄，識別並同步本次整合新增的 6 個技能（`headroom-sync`、`headroom-api`、`headroom-auto-close`、`headroom-search`、`headroom-local-edit`、`headroom-config`）至全域技能池（`~/.gemini/antigravity/skills` 或對應路徑）

2. WHEN `INSTALL.ps1` 執行完成時，THE INSTALL.ps1 SHALL 在輸出摘要中顯示獨立的「Headroom 整合技能」區塊，格式為每行一個技能：`[已同步] {技能名稱}` 或 `[略過] {技能名稱}（目錄不存在）`，並在區塊末尾顯示「共同步 N / 6 個 Headroom 技能」

3. WHEN 使用者在未包含本次新增技能的環境下執行 `INSTALL.ps1` 時，THE INSTALL.ps1 SHALL 以 `[略過]` 標示不存在的技能目錄並繼續同步其他現有技能，輸出的 exit code 為 0，不產生任何錯誤訊息或中止執行

4. WHEN `verify.ps1` 執行時，THE verify.ps1 SHALL 針對所有已存在於 `skills/dev/` 的 Headroom 衍生技能目錄，驗證 `SKILL.md` 文件存在且 YAML frontmatter 包含 `name` 與 `description` 欄位，並在現有確效報告的末尾附加「Headroom 技能格式驗證」區塊，以 `[通過]` 或 `[失敗: 原因]` 標示每個技能的驗證結果

5. THE INSTALL.ps1 SHALL 在同步 Headroom 技能時，檢查 `skills/dev/headroom-sync/.data/` 目錄是否存在，若不存在則自動建立，並在輸出摘要中標示「Headroom 快取目錄已建立」

6. WHERE 使用者已在環境變數中設定 `HEADROOM_API_KEY`，THE INSTALL.ps1 SHALL 在 Headroom 技能同步完成後，驗證 API Key 格式（8-64 個字元，包含字母與數字），並在輸出中標示「Headroom API Key 格式驗證：[通過]」或「Headroom API Key 格式驗證：[失敗]」

---

### Requirement 7: 整合文檔與知識庫更新

**User Story:** 身為 SkillsBuilder 使用者或新進開發者，我希望能找到清晰的文件說明 Headroom 整合能力的使用方式，以便快速上手並知道在什麼場景下應呼叫哪個新技能。

#### Acceptance Criteria

1. THE SkillsBuilder SHALL 在 `wiki/entities/` 目錄下新增 `headroom-integration.md` 文件，內容包含：Headroom 核心概念描述（標籤同步、Auto_Close_Rule、本地管理各一段說明）、本次整合的 6 個新技能清單（含各技能的一行說明）

2. THE SkillsBuilder 的 `README.md` SHALL 在「核心能力」章節將技能總數更新為「新增 Headroom 整合技能」，並在技能分類表中為每個新增的 Headroom 衍生技能新增一行，格式與現有條目一致（技能名稱、觸發方式、一行說明）

3. WHEN 使用者在 `instructions.html` 的搜尋框輸入 Headroom 衍生技能的名稱或關鍵詞時，THE instructions.html SHALL 在搜尋結果中顯示對應的技能項目，每個項目包含以下四個欄位：技能名稱（`code` 格式）、類別（`dev`）、觸發方式（文字說明）、適用場景描述（一行說明）

4. THE SkillsBuilder SHALL 在 `docs/` 目錄下新增 `headroom-integration-guide.md`，其中「Headroom 技能對應表」章節包含完整的對照表格（欄位：Headroom 原始能力名稱、SkillsBuilder 整合技能名稱、差異說明），「Auto_Close_Rule 配置指南」章節包含至少一個可直接複製使用的規則配置代碼塊（JSON 格式），「Headroom API Key 設定教學」章節包含環境變數設定與 API Key 生成步驟

5. WHERE 使用者執行 `headroom-api` 技能時，THE Headroom_API SHALL 在輸出開頭提示「API Key 未設定」，並連結至 `docs/headroom-integration-guide.md` 的「API Key 設定教學」章節

6. THE SkillsBuilder SHALL 在 `hooks/` 目錄下提供 `headroom-auto-sync.json` Hook 配置範例，說明如何在瀏覽器啟動或專案切換時自動觸發 `headroom-sync` 技能

---

## Appendix: Requirements Traceability Matrix

| Requirement ID | Skill Name | Primary Use Case | API Endpoint |
|----------------|------------|------------------|--------------|
| 1 | headroom-sync | 离線標籤管理 | `/tabs` |
| 2 | headroom-api | 直接標籤操作 | `/tabs/close`, `/groups`, `/sync/pull` |
| 3 | headroom-auto-close | 自動化標籤清理 | `/tabs`, `/tabs/close` |
| 4 | headroom-search | 快速標籤定位 | `tabs.json` 本地搜尋 |
| 5 | headroom-local-edit | 本地資料修改 | `tabs.json` 讀寫 |
| 6 | INSTALL.ps1, verify.ps1 | 整合部署與驗證 | N/A |
| 7 | documentation | 使用者指引 | N/A |

---

## Appendix: Headroom API Endpoints Reference

| Endpoint | Method | Description | Required Parameters |
|----------|--------|-------------|---------------------|
| `/tabs` | GET | 擷取所有標籤清單 | None |
| `/tabs/close` | POST | 關閉指定標籤 | `tab_ids` (array) |
| `/groups` | GET | 擷取所有分組清單 | None |
| `/sync/pull` | POST | 從雲端同步最新標籤 | None |
