# fix-encoding.ps1 - Batch convert files from CP950/ANSI to UTF-8 BOM
# Usage: .\fix-encoding.ps1             (dry run, shows what would change)
#        .\fix-encoding.ps1 -Apply       (actually convert)
#        .\fix-encoding.ps1 -Apply -Path ./docs  (target specific folder)
param(
    [switch]$Apply,
    [string]$Path = ".",
    [string[]]$Extensions = @("*.md", "*.txt", "*.json", "*.yaml", "*.yml")
)

$enc950   = [System.Text.Encoding]::GetEncoding(950)
$encUtf8B = [System.Text.UTF8Encoding]::new($true)
$encUtf8  = [System.Text.Encoding]::UTF8

$results = @()

foreach ($ext in $Extensions) {
    Get-ChildItem $Path -Recurse -Filter $ext -ErrorAction SilentlyContinue |
    Where-Object { $_.FullName -notmatch '\\(\.git|node_modules|strix_runs)\\' } |
    ForEach-Object {
        $file = $_
        $bytes = [System.IO.File]::ReadAllBytes($file.FullName)

        # Check BOM
        $hasBom = ($bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF)
        if ($hasBom) { return }  # Already UTF-8 BOM, skip

        # Try UTF-8 decode: count replacement chars
        $utf8Text = $encUtf8.GetString($bytes)
        $badChars = ($utf8Text.ToCharArray() | Where-Object { [int]$_ -eq 0xFFFD }).Count

        $status = if ($badChars -eq 0) { "UTF8-noBOM" } else { "CP950/mixed ($badChars garbled)" }

        $results += [PSCustomObject]@{
            File    = $file.Name
            Status  = $status
            Action  = if ($Apply) { "CONVERTED" } else { "WOULD-CONVERT" }
            SizeKB  = [math]::Round($file.Length/1KB, 1)
        }

        if ($Apply) {
            # Try CP950 decode first (better for legacy CJK files)
            $content = if ($badChars -gt 0) {
                $enc950.GetString($bytes)
            } else {
                $utf8Text
            }
            [System.IO.File]::WriteAllText($file.FullName, $content, $encUtf8B)
        }
    }
}

if ($results.Count -eq 0) {
    Write-Host "[OK] All files already in UTF-8 BOM. No action needed." -ForegroundColor Green
} else {
    $results | Format-Table -AutoSize
    if (-not $Apply) {
        Write-Host "[!!] Dry run mode. Add -Apply to actually convert." -ForegroundColor Yellow
    } else {
        Write-Host "[OK] Converted $($results.Count) files to UTF-8 BOM." -ForegroundColor Green
    }
}