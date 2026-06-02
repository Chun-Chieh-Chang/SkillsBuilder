@./skills/core/using-superpowers/SKILL.md
@./skills/core/using-superpowers/references/gemini-tools.md


# Token Efficiency & RTK Patterns (Global Mandate)

**所有 Agent 在此專案中必須優先遵循「高信號輸出」原則：**

1. **代碼探索：** 優先使用 \python tools/rtk_ls.py\ 查看目錄結構，使用 \python tools/rtk_read.py\ 查看文件簽名。禁止在未了解結構前盲目讀取全文。
2. **日誌處理：** 執行噪聲較大的命令時，必須使用重定向到文件（Tee Recovery），並僅讀取過濾後的錯誤資訊。
3. **Context 保護：** 始終思考「我是否需要這段資訊的全文？」。如果只需要簽名或結構，務必使用優化工具。

# Manus Mode (Mind to Hand) Principles

**專案核心理念：將「構思 (Mind)」轉化為「產出 (Hand)」的無縫自動化。**

1.  **目標驅動 (Goal-Oriented)**：任務執行不應僅停留在對話，必須以 `task_plan.md` 為核心，自動推進至代碼落地。
2.  **多 Agent 協作 (Multi-Agent Harmony)**：利用 `subagent-driven-development` 進行任務拆解與並行/順序執行，維持主 Context 的整潔。
3.  **自主進化 (Self-Evolution)**：每一次任務結束後的 Reflection 必須沉澱為 `findings.md` 或 `GEMINI.md` 的規則，確保系統不會在同一個地方犯兩次錯誤。
4.  **高可見性執行 (Visible Execution)**：透過 `update_topic` 讓用戶即時感知 Agent 的「思考路徑」與「操作行為」。
