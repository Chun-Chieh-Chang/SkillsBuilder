---
name: verification-before-completion
description: Use when about to claim work is complete, fixed, or passing, before committing or creating PRs - requires running verification commands and confirming output before making any success claims; evidence before assertions always
---

# Verification Before Completion

## Overview

Claiming work is complete without verification is dishonesty, not efficiency.

**Core principle:** Evidence before claims, always.

**Violating the letter of this rule is violating the spirit of this rule.**

## The Iron Law

```
NO COMPLETION CLAIMS WITHOUT FRESH VERIFICATION EVIDENCE
```

If you haven't run the verification command in this message, you cannot claim it passes.

## The Gate Function

```
BEFORE claiming any status or expressing satisfaction:

1. IDENTIFY: What command proves this claim?
2. RUN: Execute the FULL command (fresh, complete)
3. READ: Full output, check exit code, count failures
4. VERIFY: Does output confirm the claim?
   - If NO: State actual status with evidence
   - If YES: State claim WITH evidence
5. ONLY THEN: Make the claim

Skip any step = lying, not verifying
```

## Common Failures

| Claim | Requires | Not Sufficient |
|-------|----------|----------------|
| Tests pass | Test command output: 0 failures | Previous run, "should pass" |
| Linter clean | Linter output: 0 errors | Partial check, extrapolation |
| Build succeeds | Build command: exit 0 | Linter passing, logs look good |
| Bug fixed | Test original symptom: passes | Code changed, assumed fixed |
| Regression test works | Red-green cycle verified | Test passes once |
| Agent completed | VCS diff shows changes | Agent reports "success" |
| Requirements met | Line-by-line checklist | Tests passing |

## Red Flags - STOP

- Using "should", "probably", "seems to"
- Expressing satisfaction before verification ("Great!", "Perfect!", "Done!", etc.)
- About to commit/push/PR without verification
- Trusting agent success reports
- Relying on partial verification
- Thinking "just this once"
- Tired and wanting work over
- **ANY wording implying success without having run verification**

## Rationalization Prevention

| Excuse | Reality |
|--------|---------|
| "Should work now" | RUN the verification |
| "I'm confident" | Confidence ≠ evidence |
| "Just this once" | No exceptions |
| "Linter passed" | Linter ≠ compiler |
| "Agent said success" | Verify independently |
| "I'm tired" | Exhaustion ≠ excuse |
| "Partial check is enough" | Partial proves nothing |
| "Different words so rule doesn't apply" | Spirit over letter |

## Key Patterns

**Tests:**
```
✅ [Run test command] [See: 34/34 pass] "All tests pass"
❌ "Should pass now" / "Looks correct"
```

**Regression tests (TDD Red-Green):**
```
✅ Write → Run (pass) → Revert fix → Run (MUST FAIL) → Restore → Run (pass)
❌ "I've written a regression test" (without red-green verification)
```

**Build:**
```
✅ [Run build] [See: exit 0] "Build passes"
❌ "Linter passed" (linter doesn't check compilation)
```

**Requirements:**
```
✅ Re-read plan → Create checklist → Verify each → Report gaps or completion
❌ "Tests pass, phase complete"
```

**Agent delegation:**
```
✅ Agent reports success → Check VCS diff → Verify changes → Report actual state
❌ Trust agent report
```

## Why This Matters

From 24 failure memories:
- your human partner said "I don't believe you" - trust broken
- Undefined functions shipped - would crash
- Missing requirements shipped - incomplete features
- Time wasted on false completion → redirect → rework
- Violates: "Honesty is a core value. If you lie, you'll be replaced."

## When To Apply

**ALWAYS before:**
- ANY variation of success/completion claims
- ANY expression of satisfaction
- ANY positive statement about work state
- Committing, PR creation, task completion
- Moving to next task
- Delegating to agents

**Rule applies to:**
- Exact phrases
- Paraphrases and synonyms
- Implications of success
- ANY communication suggesting completion/correctness

## The Bottom Line

**No shortcuts for verification.**

Run the command. Read the output. THEN claim the result.

This is non-negotiable.

---

## 🔗 Addy Osmani 精華整合 (from shipping-and-launch)

### Pre-Launch 完整檢查清單
**代碼品質：**
- [ ] 所有測試通過（unit, integration, e2e）
- [ ] Build 無 warning
- [ ] 無 `console.log` 調試語句
- [ ] 錯誤處理覆蓋預期失敗模式

**安全：**
- [ ] 無密鑰在代碼或版控中
- [ ] `npm audit` 無 critical/high 漏洞
- [ ] 輸入驗證、認證授權就位
- [ ] CORS 配置為特定 origin（非 wildcard）

**效能：**
- [ ] Core Web Vitals 在「Good」閾值內
- [ ] 圖片已優化（壓縮、響應式、lazy loading）
- [ ] Bundle size 在預算內

### Feature Flag 生命週期
```
1. DEPLOY (Flag OFF)     → 代碼在生產環境但未啟用
2. ENABLE (團隊/beta)    → 內部在生產環境測試
3. GRADUAL ROLLOUT       → 5% → 25% → 50% → 100%
4. MONITOR (每階段)      → 監控錯誤率、效能、用戶反饋
5. CLEAN UP              → 全量上線後 2 週內移除 Flag
```
- 每個 Feature Flag 必須有負責人和過期日期
- 不可嵌套 Feature Flag

### Staged Rollout 決策閾值
| 指標 | 推進（綠燈） | 保持觀察（黃燈） | 回滾（紅燈） |
|------|-------------|-----------------|-------------|
| 錯誤率 | 基線 ±10% | 基線 10-100% ↑ | >2x 基線 |
| P95 延遲 | 基線 ±20% | 基線 20-50% ↑ | >50% 基線 ↑ |
| 客戶端 JS 錯誤 | 無新類型 | 新錯誤 <0.1% | 新錯誤 >0.1% |

### Rollback Plan 模板
每次部署前必須準備回滾計畫：
```
Trigger: 錯誤率 > 2x 基線 / P95 > Xms / 用戶報告激增
Steps:  1. 關閉 Feature Flag（<1分鐘）
        2. 或 deploy 上一版本（<5分鐘）
        3. 驗證：健康檢查、錯誤監控
        4. 通知：告知團隊回滾原因
DB:     遷移是否有回滾腳本？新數據保留或清理？
```

