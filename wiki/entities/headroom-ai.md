# headroom-ai

> **Type**: External Tool (候補技術儲備)
> **Source**: https://github.com/headroomlabs-ai/headroom
> **Status**: 🟡 知識備存 — 尚未整合（依 YAGNI 原則延後至有明確需求時）
> **Last Reviewed**: 2026-06-28

---

## 核心定位

**Headroom** 是一個 AI Agent 的 **Context 壓縮層（Context Compression Layer）**。在 LLM 收到 prompt 之前，Headroom 自動壓縮所有輸入內容（tool output、logs、RAG chunks、files、conversation history），實現 60–95% 的 token 節省，且答案精準度不下降。

```
Your Agent (Claude Code, Cursor, Codex, LangChain…)
  │  prompts · tool outputs · logs · RAG results
  ▼
┌─────────────────────────────────┐
│  Headroom  (local-first)        │
│  CacheAligner → ContentRouter   │
│    ├─ SmartCrusher  (JSON)      │
│    ├─ CodeCompressor (AST)      │
│    └─ Kompress-base (text/HF)   │
│  Cross-agent memory · MCP       │
└─────────────────────────────────┘
  │  compressed prompt
  ▼
LLM provider (Anthropic · OpenAI · Bedrock…)
```

---

## 核心能力矩陣

| 能力 | 說明 | 安裝模組 |
|:-----|:-----|:--------|
| **Library** | `from headroom import compress` — Python/TS 內嵌 | `pip install headroom-ai` |
| **Proxy** | `headroom proxy --port 8787` — 零代碼侵入 | `headroom-ai[proxy]` |
| **Agent Wrap** | `headroom wrap claude\|codex\|cursor\|cline\|continue` | base |
| **MCP Server** | `headroom_compress`, `headroom_retrieve`, `headroom_stats` | `headroom-ai[mcp]` |
| **Cross-agent Memory** | 跨 Claude/Codex/Gemini 共享記憶體，自動去重 | `headroom-ai[memory]` |
| **headroom learn** | 挖掘失敗 session，寫入 `CLAUDE.md`/`AGENTS.md`/`GEMINI.md` | base |
| **Output Shaper** | 壓縮模型回傳 token（前置詞、重複代碼）| proxy + `HEADROOM_OUTPUT_SHAPER=1` |
| **CCR Reversible** | 壓縮後原文本地快取，`headroom_retrieve` 隨時還原 | base |

---

## 實測壓縮率（官方數據）

| 工作負載 | 壓縮前 | 壓縮後 | 節省 |
|:--------|:------:|:------:|:----:|
| Code search (100 results) | 17,765 | 1,408 | **92%** |
| SRE incident debugging | 65,694 | 5,118 | **92%** |
| GitHub issue triage | 54,174 | 14,761 | **73%** |
| Codebase exploration | 78,502 | 41,254 | **47%** |

**精準度不受影響**：GSM8K ±0.000、TruthfulQA +0.030、BFCL 97%（32% 壓縮）。

---

## 與 SkillsBuilder 現有能力的關係

| Headroom 功能 | SkillsBuilder 現有等效 | 補強價值 |
|:-------------|:---------------------|:--------|
| Token 壓縮哲學 | `GEMINI.md § RTK Patterns`、`ponytail` YAGNI | 概念相同，Headroom 提供工具落地 |
| Cross-agent memory | `session-memory` skill、`knowledge-bridge` skill | Headroom 更底層、跨工具 |
| `headroom learn` (CAPA) | `DEV_LOG.md` RCA、`soul-evolution` skill | Headroom 自動化，SkillsBuilder 為手動流程 |
| MCP First 原則 | `GEMINI.md §3 MCP First` | headroom MCP server 完全符合此原則 |

---

## 整合前置條件（當需求出現時）

```bash
# 最小安裝（Library + MCP）
pip install "headroom-ai[mcp]"

# 驗證環境
headroom doctor

# MCP 配置（加入 mcp_config.template.json）
# {
#   "headroom": {
#     "command": "python",
#     "args": ["-m", "headroom.mcp"],
#     "tools": ["headroom_compress", "headroom_retrieve", "headroom_stats"]
#   }
# }

# 包裝當前 Agent（零代碼改動）
headroom wrap claude
```

---

## 整合觸發條件（何時該引入 — YAGNI Gate）

按 YAGNI 原則，以下任一條件成立時再行整合：

1. **Context Window 超限**：單次對話因 token 超限被截斷，影響功能完整性
2. **API 成本壓力**：月度 token 消耗超過預算警戒線
3. **多 Agent 跨工具記憶**：需要 Claude、Gemini、Codex 之間共享上下文
4. **`headroom learn` 需求**：需要自動從失敗 session 學習並回寫 `AGENTS.md`

---

## 注意事項

- **Python 3.10+ 必需**
- Local-first：資料不離開本機
- 壓縮可逆（CCR）：原文永遠可還原
- 與舊版 `headroom-*` browser tab skills **完全不同產品**（後者已於 2026-06-28 清除，詳見 DEV_LOG）

---

*記錄日期：2026-06-28 | 狀態：備存，待需求驅動整合*
