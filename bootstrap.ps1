# SkillsBuilder - One-Click Workspace Bootstrap Script
# Autonomously deploys IDE rules, initializes LLM Wiki, creates DEV_LOG, and updates Graphify.
# Environment: Windows PowerShell

$ErrorActionPreference = "Stop"

$srcDir = $PSScriptRoot
$destDir = $pwd.Path

Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host "🚀 SkillsBuilder: Bootstrapping Workspace..." -ForegroundColor Cyan
Write-Host "Source Directory: $srcDir" -ForegroundColor Gray
Write-Host "Target Directory: $destDir" -ForegroundColor Gray
Write-Host "=========================================================" -ForegroundColor Cyan

if ($srcDir -eq $destDir) {
    Write-Warning "Target directory is the same as SkillsBuilder source. Running in self-update mode."
}

# 1. Helper function to safely copy files and create directories
function Copy-Safe {
    param(
        [string]$RelativePath
    )
    $srcFile = Join-Path $srcDir $RelativePath
    $destFile = Join-Path $destDir $RelativePath
    
    if (Test-Path $srcFile) {
        $destParent = Split-Path $destFile -Parent
        if (-not (Test-Path $destParent)) {
            New-Item -ItemType Directory -Path $destParent -Force | Out-Null
        }
        Copy-Item -Path $srcFile -Destination $destFile -Force
        Write-Host "[DEPLOYED] $RelativePath" -ForegroundColor Green
    } else {
        Write-Host "[SKIPPED] Source file not found: $RelativePath" -ForegroundColor Yellow
    }
}

# 2. Deploy 13 IDE Rule Files
Write-Host "`n[STEP 1] Deploying IDE Rule Configuration Files..." -ForegroundColor Gray
$ruleFiles = @(
    ".cursorrules",
    "CLAUDE.md",
    ".github/copilot-instructions.md",
    ".windsurfrules",
    ".rules",
    ".trae/rules/rules.md",
    ".kiro/steering/steering.md",
    ".qoder/rules/rules.md",
    ".antigravity.md",
    "AGENTS.md",
    ".clinerules",
    ".continue/rules/rules.md"
)

foreach ($file in $ruleFiles) {
    Copy-Safe $file
}

# 3. Initialize LLM Wiki
Write-Host "`n[STEP 2] Initializing Compounding LLM Wiki..." -ForegroundColor Gray
Copy-Safe "wiki/SCHEMA.md"
Copy-Safe "wiki/index.md"

# 4. Create Standard DEV_LOG.md
Write-Host "`n[STEP 3] Deploying Anti-Vibe Coding DEV_LOG.md..." -ForegroundColor Gray
$devLogPath = Join-Path $destDir "DEV_LOG.md"
if (-not (Test-Path $devLogPath)) {
    $logTemplate = @"
# DEV_LOG.md - Target Project 開發日誌

> **⚠️ Anti-Vibe Coding 紀律宣告**
> 所有 Bug 修復與系統變更，必須在此日誌留下 RCA (Root Cause Analysis) 與 CAPA (Corrective and Preventive Actions) 的結構化紀錄。禁止「猜測性」的盲目修復。
> 
> **標準診斷模板 (Standard Diagnostic Template)：**
> - **Phase 1: Investigation (根因調查)** - 錯誤重現路徑與證據蒐集
> - **Phase 2: Pattern (模式分析)** - 正常範例對比與參考文件查閱
> - **Phase 3: Hypothesis (假設分析 RCA)** - 根本原因假設與驗證結果
> - **Phase 4: Fix & Verify (精準修復 CAPA)** - 修復邏輯、驗證結果與預防策略

---
"@
    [System.IO.File]::WriteAllText($devLogPath, $logTemplate, [System.Text.Encoding]::UTF8)
    Write-Host "[DEPLOYED] DEV_LOG.md (Clean Template)" -ForegroundColor Green
} else {
    Write-Host "[KEEPING] DEV_LOG.md already exists." -ForegroundColor Gray
}

# 5. Initialize Graphify Graph
Write-Host "`n[STEP 4] Initializing Local Codebase Graph..." -ForegroundColor Gray
if (Get-Command graphify -ErrorAction SilentlyContinue) {
    try {
        Write-Host "Running: graphify ." -ForegroundColor Gray
        Set-Location $destDir
        & graphify . --no-viz
        Write-Host "[SUCCESS] Graphify local graph initialized." -ForegroundColor Green
    } catch {
        Write-Warning "Graphify execution encountered an issue: $_"
    } finally {
        Set-Location $srcDir
    }
} else {
    Write-Host "[SKIPPED] graphify command not found. Skipping graph initialization." -ForegroundColor Yellow
}

# 6. Show Success Guide
Write-Host "`n=========================================================" -ForegroundColor Green
Write-Host "🎉 SkillsBuilder Integrated Successfully!" -ForegroundColor Green
Write-Host "All guardrails and rules are deployed." -ForegroundColor Green
Write-Host "To connect your IDE (Cursor / Claude Code) with standard tools," -ForegroundColor Green
Write-Host "please refer to the configuration templates in:" -ForegroundColor Green
Write-Host "file:///$srcDir/mcp_config.template.json" -ForegroundColor Green
Write-Host "=========================================================" -ForegroundColor Green
