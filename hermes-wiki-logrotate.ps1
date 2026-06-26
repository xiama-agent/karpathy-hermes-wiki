# hermes-wiki-logrotate.ps1 — 每天 00:00 创建当日 log 文件
# 由 Windows Task Scheduler 触发

$ErrorActionPreference = "Continue"
$LogDir = "D:\ai_schedule\hermes-brain\log"
$LogFile = "$LogDir\hermes-wiki-logrotate.log"
$Today = (Get-Date).ToString("yyyy-MM-dd")
$TodayLog = Join-Path $LogDir "$Today.md"

if (-not (Test-Path $LogDir)) {
    New-Item -ItemType Directory -Path $LogDir -Force | Out-Null
}

# 如果今天的 log 已存在，跳过
if (Test-Path $TodayLog) {
    Add-Content -Path $LogFile -Value "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] $TodayLog already exists, skip"
    exit 0
}

# 创建今日 log
$content = @"
# 操作日志 $Today

> 格式：`## [HH:mm:ss] {operation} | {description}`
> 操作类型：init / ingest / query / lint / audit / forget / soul-sync / recall-fail / meltdown

---

"@
Set-Content -Path $TodayLog -Value $content -Encoding UTF8 -NoNewline

Add-Content -Path $LogFile -Value "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] Created $TodayLog"

# 同时每天 git commit 一次（避免文件丢失）
$WikiRoot = "D:\ai_schedule\hermes-brain"
Push-Location $WikiRoot
try {
    git add log/ 2>&1 | Out-Null
    $status = git status --short 2>&1
    if ($status) {
        git commit -m "log: archive $Today" 2>&1 | Out-Null
        Add-Content -Path $LogFile -Value "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] git committed"
    }
} finally {
    Pop-Location
}

exit 0