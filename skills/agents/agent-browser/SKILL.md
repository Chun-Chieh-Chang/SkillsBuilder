---
name: agent-browser
description: Automates browser interactions (navigating websites, logging in, scraping data, filling forms, and capturing screenshots) to handle complex web workflows.
---

# Agent Browser (網頁操作自動化)

This skill enables the agent to control a browser programmatically to perform web-based tasks and extract unstructured data.

## Trigger Keywords
- "操作網頁", "網頁登入", "瀏覽器自動化", "抓取網頁數據", "agent browser", "run browser task"

## Prerequisites
- Node.js environment
- Playwright library installed: `npm install playwright` or run `npx playwright install chromium`

## Anti-Hallucination Guardrails
- **NEVER** output or log plaintext credentials (passwords, API tokens). Use environment variables.
- **NEVER** click buttons that incur monetary charges (payment checkout, subscription upgrades) without explicit user consent.
- **DO NOT** loop infinitely if a website fails to load. Max timeout should be set to 15 seconds.

## Multi-Phase Workflow

### Phase 1: Discovery
1. Check if Node.js is installed on the system.
2. Check if Playwright is available in the workspace node_modules. If not, suggest installing it.
3. Establish the target URL and the list of actions (e.g., login, navigate, scroll, extract).

### Phase 2: Execution
1. Create a temporary automation script in the `scratch/` folder (e.g., `scratch/browser_script.js`).
2. Run the script using the system terminal.
3. Save the page source or extracted JSON structure to a file.
4. Capture a final screenshot of the page and save it to `scratch/browser_last_state.png`.

### Phase 3: Verification
1. Verify that the script finished with exit code 0.
2. Check if the output file is populated.
3. Confirm the screenshot `scratch/browser_last_state.png` exists and visually demonstrates the success state.

### Phase 4: Archive (Wiki Synthesis)
1. Delete the temporary script from the `scratch/` directory.
2. Present the extracted data and the screenshot to the user.
3. Synthesize any domain-specific learning (e.g., a website's layout pattern) and document it in the project's knowledge base if reusable.

## Verification Loop
1. Verify target browser dependencies -> verify: Playwright or Puppeteer is accessible.
2. Run automation script -> verify: Script execution succeeds and outputs data to file.
3. Capture visual state -> verify: `scratch/browser_last_state.png` is generated.
