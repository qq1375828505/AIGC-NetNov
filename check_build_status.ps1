# Check GitHub Build Status Every 5 Minutes
# Run: powershell -ExecutionPolicy Bypass -File check_build_status.ps1

Write-Host "=== GitHub Build Status Monitor ===" -ForegroundColor Green
Write-Host "Monitoring: https://github.com/qq1375828505/AIGC-NetNov" -ForegroundColor Cyan
Write-Host "Checking every 5 minutes..." -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop" -ForegroundColor Red
Write-Host ""

$checkCount = 0

while ($true) {
    $checkCount++
    $currentTime = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    
    Write-Host "[$currentTime] Check #$checkCount" -ForegroundColor Yellow
    
    try {
        # Use Invoke-WebRequest to check GitHub Actions page
        $response = Invoke-WebRequest -Uri "https://github.com/qq1375828505/AIGC-NetNov/actions" -UseBasicParsing -TimeoutSec 10
        
        # Check for build status indicators
        if ($response.Content -match "Build #58.*completed") {
            Write-Host "Build #58 completed!" -ForegroundColor Green
            if ($response.Content -match "success") {
                Write-Host "Status: SUCCESS" -ForegroundColor Green
            } elseif ($response.Content -match "failure") {
                Write-Host "Status: FAILURE" -ForegroundColor Red
            }
        } elseif ($response.Content -match "Build #58.*in progress") {
            Write-Host "Build #58 is still in progress..." -ForegroundColor Yellow
        } else {
            Write-Host "Build status unknown, checking page..." -ForegroundColor Yellow
        }
    } catch {
        Write-Host "Error checking build status: $_" -ForegroundColor Red
    }
    
    Write-Host ""
    
    # Wait for 5 minutes
    Write-Host "Waiting 5 minutes before next check..." -ForegroundColor Gray
    Start-Sleep -Seconds 300
}
