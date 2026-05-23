# SkillsBuilder One-Click Sync Bootstrap Script (CP950-immune, pure ASCII)

$ErrorActionPreference = "Stop"

Write-Host "[START] Syncing SkillsBuilder global library..." -ForegroundColor Cyan

# 1. Detect Antigravity Path
# We check both antigravity-ide and antigravity path to be extremely robust!
$antigravityPath = "$HOME\.gemini\antigravity"
if (-not (Test-Path $antigravityPath)) {
    $antigravityPath = "$HOME\.gemini\antigravity-ide"
}

if (-not (Test-Path $antigravityPath)) {
    Write-Host "[ERROR] Antigravity installation folder not found." -ForegroundColor Red
    exit 1
}

$currentDir = Get-Location
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
$rulesContent = "## Global Development Rulebook (SkillsBuilder)`r`n- Source Repo: $($currentDir.Path)`r`n- Wiki Schema: file:///$($currentDir.Path.Replace('\','/'))/wiki/SCHEMA.md`r`n- Logic: Karpathy LLM Wiki + PDCA SOP`r`n"
$rulesContent | Out-File -FilePath (Join-Path $kiArtifacts "global_rules.md") -Encoding UTF8

Write-Host "[SUCCESS] SkillsBuilder global sync complete!" -ForegroundColor Green
