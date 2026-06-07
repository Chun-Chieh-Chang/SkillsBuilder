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
    $skillDest = Join-Path $skillsDir $skillName
    
    if (Test-Path $skillSource) {
        # Create headroom-cache directory if it doesn't exist
        $headroomCache = Join-Path $skillSource ".data"
        if (-not (Test-Path $headroomCache)) {
            New-Item -ItemType Directory -Path $headroomCache -Force | Out-Null
            Write-Host "[Headroom Cache Created] $skillName" -ForegroundColor Green
        }
        
        # Check API key format for headroom skills
        if ($skillName -match "headroom") {
            $apiKey = $env:HEADROOM_API_KEY
            if ($apiKey -and $apiKey -match "^[a-zA-Z0-9]{8,64}$") {
                Write-Host "[PASSED] HEADROOM_API_KEY Format Validation ($($skillName))" -ForegroundColor Green
            } else {
                Write-Host "[FAILED] HEADROOM_API_KEY Format Validation ($($skillName))" -ForegroundColor Red
            }
        }
        
        Write-Host "[SYNCED] $skillName" -ForegroundColor Green
        $syncedCount++
    } else {
        Write-Host "[SKIPPED] $skillName (Directory Not Found)" -ForegroundColor Yellow
    }
}

Write-Host "[SYNCED $syncedCount / 15 ECC Skills]" -ForegroundColor Cyan

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

Write-Host "[SUCCESS] SkillsBuilder global sync complete!" -ForegroundColor Green

