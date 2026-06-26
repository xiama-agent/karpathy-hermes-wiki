# hermes-wiki-lint.ps1 — 每 6 小时跑 Wiki lint
# 由 Windows Task Scheduler 触发
# 输出：D:\ai_schedule\hermes-brain\wiki\99-temp\lint-{date}.md

$ErrorActionPreference = "Continue"
$LogFile = "D:\ai_schedule\hermes-brain\wiki\99-temp\lint-cron.log"
$WikiRoot = "D:\ai_schedule\hermes-brain"
$NodeExe = (Get-Command node.exe -ErrorAction SilentlyContinue).Source
if (-not $NodeExe) {
    # 常见 Node 路径回退
    $Candidates = @(
        "C:\Program Files\nodejs\node.exe",
        "C:\Program Files (x86)\nodejs\node.exe"
    )
    foreach ($c in $Candidates) {
        if (Test-Path $c) { $NodeExe = $c; break }
    }
}
if (-not $NodeExe) {
    Add-Content -Path $LogFile -Value "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] FATAL: node.exe not found"
    exit 1
}

$LintScript = Join-Path $WikiRoot "lint.js"
if (-not (Test-Path $LintScript)) {
    Add-Content -Path $LogFile -Value "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] FATAL: lint.js not found at $LintScript"
    exit 1
}

Push-Location $WikiRoot
try {
    $output = & $NodeExe $LintScript 2>&1 | Out-String
    $today = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    Add-Content -Path $LogFile -Value "[$today] lint.js completed successfully"
    Add-Content -Path $LogFile -Value "---"
    Add-Content -Path $LogFile -Value $output
} catch {
    Add-Content -Path $LogFile -Value "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] ERROR: $_"
} finally {
    Pop-Location
}