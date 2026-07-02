# SkillsBuilder One-Click Sync Bootstrap Script (CP950-immune, pure ASCII)

$ErrorActionPreference = "Stop"

# --- Context Detection (Sidecar vs Core) ---
$currentDir = Get-Location
# We detect if we are in the main repository by looking for the .kiro directory or current-work-status.json
$isCoreRepo = (Test-Path (Join-Path $currentDir ".kiro")) -or (Test-Path (Join-Path $currentDir "current-work-status.json"))

if ($isCoreRepo) {
    Write-Host "[START] Syncing SkillsBuilder global library (Core Mode)..." -ForegroundColor Cyan
} else {
    Write-Host "[START] Initializing SkillsBuilder Sidecar Architecture (DevOS Mode)..." -ForegroundColor Cyan
}

# 1. Detect Antigravity Paths (support multiple installations horizontally)
$pathsToSync = @()
if (Test-Path "$HOME\.gemini\antigravity") { $pathsToSync += "$HOME\.gemini\antigravity" }
if (Test-Path "$HOME\.gemini\antigravity-ide") { $pathsToSync += "$HOME\.gemini\antigravity-ide" }

if ($pathsToSync.Count -eq 0) {
    Write-Host "[ERROR] Antigravity installation folder not found." -ForegroundColor Red
    exit 1
}

# --- Sidecar Mode logic ---
if (-not $isCoreRepo) {
    Write-Host "[INFO] Non-invasive Sidecar detected. Injecting pointer into CLAUDE.md (Master Source)..." -ForegroundColor Cyan
    
    $masterRulePath = Join-Path $currentDir "CLAUDE.md"
    $globalSkillsPath = "$HOME\.gemini\antigravity\skills".Replace('\', '/')
    
    $sidecarPointer = @"

---
# 🚀 SkillsBuilder DevOS Sidecar Context
> **Global Mandate**: This project is integrated with the SkillsBuilder DevOS Architecture.
> All professional development skills are globally installed and managed at:
> `$globalSkillsPath`
>
> **The 1% Rule**: If there is even a 1% chance a skill from the global library applies to your current task, you MUST invoke it using the `activate_skill` tool (or your IDE's equivalent) by referencing the global path if necessary.
---
"@

    if (Test-Path $masterRulePath) {
        $content = Get-Content $masterRulePath -Raw
        if ($content -notmatch "SkillsBuilder DevOS Sidecar Context") {
            $sidecarPointer | Add-Content -Path $masterRulePath
            Write-Host "[SUCCESS] Appended DevOS Sidecar pointer to CLAUDE.md" -ForegroundColor Green
        } else {
            Write-Host "[INFO] DevOS Sidecar pointer already exists in CLAUDE.md" -ForegroundColor Gray
        }
    } else {
        $sidecarPointer | Out-File -FilePath $masterRulePath -Encoding UTF8
        Write-Host "[SUCCESS] Created CLAUDE.md with DevOS Sidecar pointer" -ForegroundColor Green
    }
}
# ---------------------------

# --- Auto-provision Graphifyy ---
Write-Host "[INFO] Checking Graphifyy installation status..." -ForegroundColor Cyan
$graphifyInstalled = $false
try {
    $null = Get-Command graphify -ErrorAction Stop
    $graphifyInstalled = $true
    Write-Host "[SUCCESS] Graphify CLI is already installed!" -ForegroundColor Green
} catch {
    Write-Host "[INFO] Graphify CLI not found. Attempting to install graphifyy..." -ForegroundColor Yellow
    
    # Try using 'uv' tool first
    try {
        $null = Get-Command uv -ErrorAction Stop
        Write-Host "[INFO] Detected uv. Installing graphifyy using uv..." -ForegroundColor Cyan
        $null = Start-Process uv -ArgumentList "tool", "install", "graphifyy" -NoNewWindow -Wait -ErrorAction Stop
        $graphifyInstalled = $true
        Write-Host "[SUCCESS] Graphifyy installed successfully via uv!" -ForegroundColor Green
    } catch {
        # Fallback to 'pip'
        try {
            $null = Get-Command pip -ErrorAction Stop
            Write-Host "[INFO] Detected pip. Installing graphifyy using pip..." -ForegroundColor Cyan
            $null = Start-Process pip -ArgumentList "install", "graphifyy" -NoNewWindow -Wait -ErrorAction Stop
            $graphifyInstalled = $true
            Write-Host "[SUCCESS] Graphifyy installed successfully via pip!" -ForegroundColor Green
        } catch {
            Write-Host "[WARNING] Neither uv nor pip was found. Skipping automatic Graphifyy installation." -ForegroundColor Yellow
            Write-Host "[WARNING] Please manually install graphifyy using: pip install graphifyy" -ForegroundColor Yellow
        }
    }
}

if ($graphifyInstalled) {
    try {
        Write-Host "[INFO] Registering global Graphify plugins..." -ForegroundColor Cyan
        $null = Start-Process graphify -ArgumentList "install" -NoNewWindow -Wait -ErrorAction Stop
        
        Write-Host "[INFO] Registering local workspace Git hooks for Graphify..." -ForegroundColor Cyan
        $null = Start-Process graphify -ArgumentList "hook", "install" -NoNewWindow -Wait -ErrorAction Stop
        Write-Host "[SUCCESS] Graphify registered successfully!" -ForegroundColor Green
    } catch {
        Write-Host "[WARNING] Graphify post-install steps failed: $_" -ForegroundColor Yellow
    }
}
# --------------------------------

# --- Auto-provision SkillOpt ---
Write-Host "[INFO] Checking SkillOpt installation status..." -ForegroundColor Cyan
$skilloptInstalled = $false
try {
    $null = python -c "import skillopt" 2>$null
    if ($LASTEXITCODE -eq 0) {
        $skilloptInstalled = $true
        Write-Host "[SUCCESS] SkillOpt is already installed!" -ForegroundColor Green
    } else {
        throw "Not installed"
    }
} catch {
    Write-Host "[INFO] SkillOpt not found. Attempting to install skillopt..." -ForegroundColor Yellow
    try {
        $null = Start-Process pip -ArgumentList "install", "skillopt" -NoNewWindow -Wait -ErrorAction Stop
        $skilloptInstalled = $true
        Write-Host "[SUCCESS] SkillOpt installed successfully via pip!" -ForegroundColor Green
    } catch {
        Write-Host "[WARNING] pip install skillopt failed. Please manually install skillopt." -ForegroundColor Yellow
    }
}
# --------------------------------

# --- Auto-provision codebase-memory-mcp ---
Write-Host "[INFO] Checking codebase-memory-mcp installation status..." -ForegroundColor Cyan
$destExe = Join-Path $currentDir "tools\codebase-memory-mcp.exe"
if (-not (Test-Path $destExe)) {
    Write-Host "[INFO] codebase-memory-mcp.exe not found. Downloading latest Windows release..." -ForegroundColor Yellow
    try {
        $zipPath = Join-Path $currentDir "tools\codebase-memory-mcp-windows-amd64.zip"
        $downloadUrl = "https://github.com/DeusData/codebase-memory-mcp/releases/latest/download/codebase-memory-mcp-windows-amd64.zip"
        
        Write-Host "[DOWNLOAD] Fetching from: $downloadUrl" -ForegroundColor Gray
        $webClient = New-Object System.Net.WebClient
        $webClient.DownloadFile($downloadUrl, $zipPath)
        
        Write-Host "[EXTRACT] Extracting binary..." -ForegroundColor Gray
        $tempExtractDir = Join-Path $currentDir "tools\cbm_temp"
        if (Test-Path $tempExtractDir) { Remove-Item $tempExtractDir -Recurse -Force }
        New-Item -ItemType Directory -Path $tempExtractDir -Force | Out-Null
        
        Expand-Archive -Path $zipPath -DestinationPath $tempExtractDir -Force
        
        $extractedExe = Get-ChildItem -Path $tempExtractDir -Filter "*.exe" -Recurse | Select-Object -First 1
        if ($extractedExe) {
            Move-Item -Path $extractedExe.FullName -Destination $destExe -Force
            Write-Host "[SUCCESS] codebase-memory-mcp.exe successfully installed to tools/" -ForegroundColor Green
        } else {
            Write-Host "[ERROR] Could not find codebase-memory-mcp.exe in extracted files!" -ForegroundColor Red
        }
        
        # Cleanup
        Remove-Item $tempExtractDir -Recurse -Force
        Remove-Item $zipPath -Force
    } catch {
        Write-Host "[WARNING] Failed to download/install codebase-memory-mcp: $_" -ForegroundColor Yellow
        Write-Host "[WARNING] You can manually download the Windows binary from GitHub and place it at tools\codebase-memory-mcp.exe" -ForegroundColor Yellow
    }
} else {
    Write-Host "[SUCCESS] codebase-memory-mcp.exe is already installed!" -ForegroundColor Green
}
# ------------------------------------------

$currentDir = Get-Location

foreach ($antigravityPath in $pathsToSync) {
    Write-Host "[INFO] Processing Antigravity directory: $antigravityPath" -ForegroundColor Cyan
    
    $skillsDir = Join-Path $antigravityPath "skills"
    $knowledgeDir = Join-Path $antigravityPath "knowledge"

    # 2. Create required directories
    if (-not (Test-Path $skillsDir)) { New-Item -ItemType Directory -Path $skillsDir -Force }
    if (-not (Test-Path $knowledgeDir)) { New-Item -ItemType Directory -Path $knowledgeDir -Force }

    # 3. Register all skills (recursively link all categories)
    Write-Host "[INFO] Linking global skills library..." -ForegroundColor Yellow
    $categories = Get-ChildItem -Path (Join-Path $currentDir "skills") -Directory

    foreach ($category in $categories) {
        $skillsInCat = Get-ChildItem -Path $category.FullName -Directory
        foreach ($skill in $skillsInCat) {
            $skillSource = $skill.FullName
            $skillDest = Join-Path $skillsDir $skill.Name
            
            Write-Host "[LINK] Processing skill: $($category.Name)/$($skill.Name)" -ForegroundColor Gray
            if (Test-Path $skillDest) { Remove-Item $skillDest -Recurse -Force }
            
            try {
                # Try to create symbolic link first
                $null = New-Item -ItemType SymbolicLink -Path $skillDest -Target $skillSource -Force -ErrorAction Stop
                Write-Host "[LINK] Created SymbolicLink for $($skill.Name)" -ForegroundColor DarkGray
            } catch {
                # Fallback to copy directory if symbolic link fails (requires admin privileges)
                Write-Host "[FALLBACK] Symlink failed (elevation required). Copying directory..." -ForegroundColor Yellow
                Copy-Item -Path $skillSource -Destination $skillDest -Recurse -Force
            }
        }
    }

    # 4. Register global Knowledge Item (KI)
    $kiPath = Join-Path $knowledgeDir "skills_builder"
    $kiArtifacts = Join-Path $kiPath "artifacts"

    Write-Host "[INFO] Creating global knowledge index (Knowledge Item)..." -ForegroundColor Yellow
    if (-not (Test-Path $kiArtifacts)) { New-Item -ItemType Directory -Path $kiArtifacts -Force }

    # Generate metadata.json (use double single-quotes or escaped double-quotes for JSON properties)
    # To avoid the & parse issue, let's keep all strings strictly simple ASCII.
    $metadata = @{
        title = "SkillsBuilder Architecture and SOP"
        summary = "The master governance system for AI-agentic development."
        created_at = (Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ")
        updated_at = (Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ")
        references = @("file:///$($currentDir.Path.Replace('\','/'))/wiki/SCHEMA.md")
        tags = @("sop", "wiki", "llm-wiki", "pdca")
    } | ConvertTo-Json

    $metadata | Out-File -FilePath (Join-Path $kiPath "metadata.json") -Encoding UTF8

    # 5. Output global rules snapshot
    $wikiRulesPath = Join-Path $currentDir "wiki\global_rules.md"
    if (Test-Path $wikiRulesPath) {
        Copy-Item -Path $wikiRulesPath -Destination (Join-Path $kiArtifacts "global_rules.md") -Force
        Write-Host "[INFO] Copied version-controlled global rules to KI artifacts." -ForegroundColor DarkGray
    } else {
        $rulesContent = "## Global Development Rulebook (SkillsBuilder)`r`n- Source Repo: $($currentDir.Path)`r`n- Wiki Schema: file:///$($currentDir.Path.Replace('\','/'))/wiki/SCHEMA.md`r`n- Logic: Karpathy LLM Wiki + PDCA SOP`r`n"
        $rulesContent | Out-File -FilePath (Join-Path $kiArtifacts "global_rules.md") -Encoding UTF8
    }
}

# 6. ECC Integration - Sync 15 new ECC skills
Write-Host "[INFO] Synchronizing ECC Integration skills..." -ForegroundColor Cyan
$eccSkills = @(
    "typescript-reviewer", "python-reviewer", "go-reviewer", "rust-reviewer", "django-reviewer", "kotlin-reviewer",
    "typescript-build-resolver", "python-build-resolver", "go-build-resolver", "rust-build-resolver",
    "agent-shield", "hooks-enhancer", "harness-optimizer", "ecc-migrator", "loop-operator"
)

$syncedCount = 0
Write-Host "[ECC INTEGRATION]" -ForegroundColor Cyan

foreach ($skillName in $eccSkills) {
    $skillSource = Join-Path $currentDir "skills\dev\$skillName"
    
    if (Test-Path $skillSource) {
        Write-Host "[VERIFIED] ECC Skill: $skillName" -ForegroundColor Green
        $syncedCount++
    } else {
        Write-Host "[SKIPPED] $skillName (Directory Not Found)" -ForegroundColor Yellow
    }
}

Write-Host "[SYNCED $syncedCount / 15 ECC Skills]" -ForegroundColor Cyan

# 6b. Addy Osmani Agent Skills Submodule Sync
Write-Host "[INFO] Synchronizing Addy Osmani Agent Skills..." -ForegroundColor Cyan
$agentSkillsSrc = Join-Path $currentDir "raw\agent-skills"

# Initialize submodule if not present
if (-not (Test-Path (Join-Path $agentSkillsSrc "skills"))) {
    Write-Host "[INFO] Initializing agent-skills submodule..." -ForegroundColor Yellow
    Push-Location $currentDir
    git submodule update --init --recursive 2>$null
    Pop-Location
}

$addySkills = @(
    @{ Src="spec-driven-development"; Dest="addy-spec-driven-dev"; Cat="dev" },
    @{ Src="incremental-implementation"; Dest="addy-incremental-impl"; Cat="dev" },
    @{ Src="api-and-interface-design"; Dest="addy-api-design"; Cat="dev" },
    @{ Src="doubt-driven-development"; Dest="addy-doubt-driven-dev"; Cat="dev" },
    @{ Src="source-driven-development"; Dest="addy-source-driven-dev"; Cat="dev" },
    @{ Src="browser-testing-with-devtools"; Dest="addy-browser-testing"; Cat="dev" },
    @{ Src="security-and-hardening"; Dest="addy-security-hardening"; Cat="dev" },
    @{ Src="performance-optimization"; Dest="addy-performance-opt"; Cat="dev" },
    @{ Src="ci-cd-and-automation"; Dest="addy-ci-cd-automation"; Cat="dev" },
    @{ Src="deprecation-and-migration"; Dest="addy-deprecation-migration"; Cat="dev" },
    @{ Src="documentation-and-adrs"; Dest="addy-docs-adrs"; Cat="dev" },
    @{ Src="observability-and-instrumentation"; Dest="addy-observability"; Cat="dev" },
    @{ Src="context-engineering"; Dest="addy-context-engineering"; Cat="core" }
)

$addySynced = 0
Write-Host "[ADDY AGENT SKILLS INTEGRATION]" -ForegroundColor Cyan

foreach ($s in $addySkills) {
    $srcPath = Join-Path $agentSkillsSrc "skills\$($s.Src)"
    $destPath = Join-Path $skillsDir $s.Dest

    if (Test-Path $srcPath) {
        if (-not (Test-Path $destPath)) {
            try {
                New-Item -ItemType SymbolicLink -Path $destPath -Target $srcPath -Force -ErrorAction Stop | Out-Null
            } catch {
                Copy-Item -Path $srcPath -Destination $destPath -Recurse -Force
            }
        }
        Write-Host "[SYNCED] $($s.Dest)" -ForegroundColor Green
        $addySynced++
    } else {
        Write-Host "[SKIPPED] $($s.Dest) (Source not found in submodule)" -ForegroundColor Yellow
    }
}

Write-Host "[SYNCED $addySynced / 13 Addy Agent Skills]" -ForegroundColor Cyan


# 7. Verify and ensure root IDE rules are deployed
Write-Host "[INFO] Verifying workspace IDE rule configurations..." -ForegroundColor Cyan
$ruleFiles = @(
    @{ Path = Join-Path $currentDir ".cursorrules"; Type = "Cursor" },
    @{ Path = Join-Path $currentDir "CLAUDE.md"; Type = "Claude Code" },
    @{ Path = Join-Path $currentDir ".github\copilot-instructions.md"; Type = "GitHub Copilot" },
    @{ Path = Join-Path $currentDir "GEMINI.md"; Type = "Gemini CLI / Antigravity" },
    @{ Path = Join-Path $currentDir ".windsurfrules"; Type = "Windsurf" },
    @{ Path = Join-Path $currentDir ".rules"; Type = "Zed" },
    @{ Path = Join-Path $currentDir ".trae\rules\rules.md"; Type = "Trae" },
    @{ Path = Join-Path $currentDir ".kiro\steering\steering.md"; Type = "Kiro" },
    @{ Path = Join-Path $currentDir ".qoder\rules\rules.md"; Type = "Qoder" },
    @{ Path = Join-Path $currentDir ".antigravity.md"; Type = "Antigravity CLI" },
    @{ Path = Join-Path $currentDir "AGENTS.md"; Type = "Codex CLI" },
    @{ Path = Join-Path $currentDir ".clinerules"; Type = "Cline / Roo Code" },
    @{ Path = Join-Path $currentDir ".continue\rules\rules.md"; Type = "Continue" },
    @{ Path = Join-Path $currentDir ".opencode\rules\rules.md"; Type = "OpenCode" }
)

foreach ($rf in $ruleFiles) {
    $sourceRule = Join-Path $currentDir "CLAUDE.md"
    
    # Skip CLAUDE.md itself to avoid copying onto itself
    if ($rf.Path -eq $sourceRule) {
        Write-Host "[SUCCESS] Source: CLAUDE.md is the main source of truth." -ForegroundColor Green
        continue
    }

    # For specialized rules (GEMINI.md and AGENTS.md), only provision if missing, do not overwrite automatically
    if ($rf.Path.EndsWith("GEMINI.md") -or $rf.Path.EndsWith("AGENTS.md")) {
        if (Test-Path $rf.Path) {
            Write-Host "[SUCCESS] Found existing specialized rule: $($rf.Type)" -ForegroundColor Green
        } else {
            Write-Host "[WARNING] Missing specialized rule: $($rf.Type), provisioning from CLAUDE.md..." -ForegroundColor Yellow
            $parent = Split-Path $rf.Path
            if (-not (Test-Path $parent)) { New-Item -ItemType Directory -Path $parent -Force | Out-Null }
            Copy-Item -Path $sourceRule -Destination $rf.Path -Force
            Write-Host "[INFO] Provisioned $($rf.Type) from CLAUDE.md" -ForegroundColor Gray
        }
    } else {
        # For general rules, always overwrite from CLAUDE.md to ensure all files are in sync
        $parent = Split-Path $rf.Path
        if (-not (Test-Path $parent)) { New-Item -ItemType Directory -Path $parent -Force | Out-Null }
        
        Copy-Item -Path $sourceRule -Destination $rf.Path -Force
        Write-Host "[SYNCED] Updated $($rf.Type) rules at $($rf.Path) from CLAUDE.md" -ForegroundColor Green
    }
}

# 8. Auto-provision MCP Server Configuration
Write-Host "[INFO] Registering SkillsBuilder MCP Server into global configs..." -ForegroundColor Cyan
$mcpScriptPath = (Join-Path $currentDir "tools\mcp_server.js").Replace('\', '/')
$claudeConfigPaths = @(
    "$HOME\.claude.json",
    "$HOME\.claude-desktop\mcp.json"
)

foreach ($cp in $claudeConfigPaths) {
    if (Test-Path $cp) {
        try {
            $config = Get-Content -Path $cp -Raw | ConvertFrom-Json
            if (-not $config.mcpServers) {
                $config | Add-Member -MemberType NoteProperty -Name "mcpServers" -Value (New-Object PSObject)
            }
            # Only update if there isn't a conflict or if it's missing
            $skillConfig = @{
                command = "node"
                args = @($mcpScriptPath)
                cwd = $currentDir.Path.Replace('\', '/')
            }
            if (-not $config.mcpServers.skillsbuilder) {
                $config.mcpServers | Add-Member -MemberType NoteProperty -Name "skillsbuilder" -Value $skillConfig
            } else {
                $config.mcpServers.skillsbuilder = $skillConfig
            }
            $config | ConvertTo-Json -Depth 10 | Out-File -FilePath $cp -Encoding UTF8
            Write-Host "[SUCCESS] Registered MCP in Claude config: $cp" -ForegroundColor Green
        } catch {
            Write-Host "[WARNING] Failed to update Claude config at $cp : $_" -ForegroundColor Yellow
        }
    }
}

# 9. Install Global CLI Router
Write-Host "[INFO] Installing 'sb' global CLI..." -ForegroundColor Cyan
$globalBin = "$HOME\.gemini\antigravity\bin"
if (-not (Test-Path $globalBin)) { New-Item -ItemType Directory -Path $globalBin -Force | Out-Null }

$sbContent = @"
# SkillsBuilder Global CLI Router
`$ErrorActionPreference = "Stop"
`$sbPath = "$($currentDir.Path)"
if (`$args.Count -eq 0) {
    Write-Host "SkillsBuilder CLI (sb) - Configured Path: `$sbPath" -ForegroundColor Cyan
    Write-Host "Usage: sb <command> [args]"
    Write-Host "Available commands: verify, understand, install, or any script in tools/"
    exit 0
}
`$command = `$args[0]
`$passArgs = if (`$args.Count -gt 1) { `$args[1..(`$args.Count-1)] } else { @() }
switch (`$command) {
    "verify" { powershell -ExecutionPolicy Bypass -File (Join-Path `$sbPath "verify.ps1") `$passArgs }
    "understand" { python (Join-Path `$sbPath "tools\understand_bridge.py") `$passArgs }
    "install" { powershell -ExecutionPolicy Bypass -File (Join-Path `$sbPath "INSTALL.ps1") `$passArgs }
    default {
        `$pyTool = Join-Path `$sbPath "tools\`$command.py"
        `$psTool = Join-Path `$sbPath "tools\`$command.ps1"
        if (Test-Path `$pyTool) { python `$pyTool `$passArgs }
        elseif (Test-Path `$psTool) { powershell -ExecutionPolicy Bypass -File `$psTool `$passArgs }
        else { Write-Host "[ERROR] Unknown command: `$command" -ForegroundColor Red; exit 1 }
    }
}
"@
$sbContent | Out-File -FilePath (Join-Path $globalBin "sb.ps1") -Encoding UTF8
Write-Host "[SUCCESS] Global CLI installed at $globalBin\sb.ps1" -ForegroundColor Green
Write-Host "[INFO] Ensure $globalBin is in your system PATH to use 'sb' from anywhere." -ForegroundColor Yellow

Write-Host "[SUCCESS] SkillsBuilder global sync complete!" -ForegroundColor Green
