# Move project to English path script
# Run: powershell -ExecutionPolicy Bypass -File move_to_english_path.ps1

Write-Host "=== Moving project to English path ===" -ForegroundColor Green

$sourcePath = "D:\工作区\项目\小说软件\AIGC-NetNov"
$targetPath = "D:\Projects\AIGC-NetNov"

Write-Host "`nSource path: $sourcePath" -ForegroundColor Yellow
Write-Host "Target path: $targetPath" -ForegroundColor Yellow

# Check if target path exists
if (Test-Path $targetPath) {
    Write-Host "`nTarget path already exists!" -ForegroundColor Red
    Write-Host "Please delete or rename the existing folder first." -ForegroundColor Red
    Write-Host "Or choose a different target path." -ForegroundColor Red
} else {
    Write-Host "`nMoving project..." -ForegroundColor Yellow
    try {
        Move-Item -Path $sourcePath -Destination $targetPath -Force
        Write-Host "Project moved successfully!" -ForegroundColor Green
        Write-Host "`nNew project path: $targetPath" -ForegroundColor Cyan
        Write-Host "`nPlease:" -ForegroundColor Yellow
        Write-Host "1. Close Android Studio" -ForegroundColor Yellow
        Write-Host "2. Open Android Studio" -ForegroundColor Yellow
        Write-Host "3. Click 'Open an existing project'" -ForegroundColor Yellow
        Write-Host "4. Navigate to: $targetPath" -ForegroundColor Yellow
        Write-Host "5. Click 'OK'" -ForegroundColor Yellow
    } catch {
        Write-Host "Error moving project: $_" -ForegroundColor Red
    }
}

Write-Host "`n=== Script Complete ===" -ForegroundColor Green
