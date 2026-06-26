# hermes-wiki-backup.ps1 — 每周日 23:00 自动 git bundle 备份
# 由 Windows Task Scheduler 触发

$ErrorActionPreference = "Continue"
$WikiRoot = "D:\ai_schedule\hermes-brain"
$BackupDir = "D:\ai_schedule\backup"
$LogFile = "$WikiRoot\wiki\99-temp\backup-cron.log"

if (-not (Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
}

$Date = Get-Date -Format "yyyyMMdd"
$BundlePath = Join-Path $BackupDir "hermes-wiki-$Date.bundle"

Push-Location $WikiRoot
try {
    # First commit any pending changes
    git add -A 2>&1 | Out-Null
    $status = git status --short 2>&1
    if ($status) {
        git commit -m "auto-backup: snapshot before weekly bundle" 2>&1 | Out-Null
    }

    # Create bundle (full history)
    git bundle create $BundlePath --all 2>&1 | Out-Null

    if (Test-Path $BundlePath) {
        $size = [math]::Round((Get-Item $BundlePath).Length / 1KB, 1)
        Add-Content -Path $LogFile -Value "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] Backup OK: $BundlePath ($size KB)"
    } else {
        Add-Content -Path $LogFile -Value "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] Backup FAILED"
    }

    # Cleanup old bundles (>30 days)
    Get-ChildItem $BackupDir -Filter "hermes-wiki-*.bundle" | Where-Object {
        $_.LastWriteTime -lt (Get-Date).AddDays(-30)
    } | ForEach-Object {
        Remove-Item $_.FullName -Force
        Add-Content -Path $LogFile -Value "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] Cleaned old: $($_.Name)"
    }
} finally {
    Pop-Location
}

exit 0