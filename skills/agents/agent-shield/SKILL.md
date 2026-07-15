---
name: agent-shield
description: Security scanner for hardcoded secrets, dynamic execution, and injection risks.
---

# AgentShield

AgentShield is a security scanning system designed to protect your codebase from common security vulnerabilities before they are committed or pushed. It can be integrated into git hooks or called manually to scan staged files or code snippets.

## Features

- **Hardcoded Secrets Detection**: Scans for API keys, passwords, and tokens using regex patterns.
- **Dynamic Execution Detection**: Detects potentially dangerous `eval()` and `exec()` calls.
- **Dependency Vulnerability Scan**: Checks `package.json` and `requirements.txt` for known high-risk package versions.
- **Injection Risk Detection**: Identifies potential SQL and shell injection patterns.

## Security Levels

- **Critical**: Aborts execution/git push. Includes authentication bypass, data leaks, remote code execution, and `eval()`/`exec()`.
- **Warning**: Reports issues but allows execution. Includes security best practice violations like missing input validation.

## Usage

### Git Hook Mode
Triggered automatically on `git push` if configured. It scans staged files and reports any Critical issues.

### Manual Mode
Scan a specific file or code snippet (up to 500 lines):
`agent-shield scan path/to/file.ts`

## Report Format

```markdown
## [問題類型]
(a) 硬編碼秘鑰 / (b) 動態執行 / (c) 套件漏洞 / (d) 注入風險

## [檔案路徑與行號]
path/to/file.ts:42

## [修復建議]
[具體修復指南]
```

## Trigger Keywords
安全掃描, security scan, secrets detection, AgentShield, injection risk

## Prerequisites
- git (for hook mode)
- regex support
- access to dependency files (package.json, requirements.txt)
