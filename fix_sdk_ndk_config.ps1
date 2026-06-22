# Fix Android SDK/NDK Configuration Script
# Run: powershell -ExecutionPolicy Bypass -File fix_sdk_ndk_config.ps1

Write-Host "=== Fixing Android SDK/NDK Configuration ===" -ForegroundColor Green

# 1. Check Android SDK path
$sdkPath = "C:\Users\1111\AppData\Local\Android\Sdk"
Write-Host "`n1. Checking Android SDK path..." -ForegroundColor Yellow

if (Test-Path $sdkPath) {
    Write-Host "   SDK path exists: $sdkPath" -ForegroundColor Green
} else {
    Write-Host "   SDK path not found: $sdkPath" -ForegroundColor Red
}

# 2. Check NDK installation
$ndkPath = "$sdkPath\ndk"
Write-Host "`n2. Checking NDK installation..." -ForegroundColor Yellow

if (Test-Path $ndkPath) {
    $ndkVersions = Get-ChildItem -Path $ndkPath -Directory | Select-Object -ExpandProperty Name
    Write-Host "   NDK installed, versions: $($ndkVersions -join ', ')" -ForegroundColor Green
} else {
    Write-Host "   NDK not installed" -ForegroundColor Red
    Write-Host "   Please install NDK in Android Studio" -ForegroundColor Red
    Write-Host "   Path: File -> Settings -> Languages and Frameworks -> Android SDK -> SDK Tools -> NDK (Side by side)" -ForegroundColor Cyan
}

# 3. Check CMake installation
$cmakePath = "$sdkPath\cmake"
Write-Host "`n3. Checking CMake installation..." -ForegroundColor Yellow

if (Test-Path $cmakePath) {
    $cmakeVersions = Get-ChildItem -Path $cmakePath -Directory | Select-Object -ExpandProperty Name
    Write-Host "   CMake installed, versions: $($cmakeVersions -join ', ')" -ForegroundColor Green
} else {
    Write-Host "   CMake not installed" -ForegroundColor Red
    Write-Host "   Please install CMake in Android Studio" -ForegroundColor Red
    Write-Host "   Path: File -> Settings -> Languages and Frameworks -> Android SDK -> SDK Tools -> CMake" -ForegroundColor Cyan
}

# 4. Check local.properties file
$localPropertiesPath = "d:\工作区\项目\小说软件\AIGC-NetNov\local.properties"
Write-Host "`n4. Checking local.properties file..." -ForegroundColor Yellow

if (Test-Path $localPropertiesPath) {
    $localProperties = Get-Content -Path $localPropertiesPath -Raw
    if ($localProperties -match "sdk.dir=") {
        Write-Host "   local.properties has SDK path configured" -ForegroundColor Green
    } else {
        Write-Host "   local.properties missing SDK path" -ForegroundColor Red
        Write-Host "   Adding SDK path..." -ForegroundColor Yellow
        Add-Content -Path $localPropertiesPath -Value "`nsdk.dir=C\:\\Users\\1111\\AppData\\Local\\Android\\Sdk"
        Write-Host "   SDK path added to local.properties" -ForegroundColor Green
    }
} else {
    Write-Host "   local.properties file not found" -ForegroundColor Red
    Write-Host "   Creating local.properties file..." -ForegroundColor Yellow
    $content = @"
## This file must NOT be checked into Version Control Systems,
# as it contains information specific to your local configuration.
#
# Location of the SDK. This is only used by Gradle.
sdk.dir=C\:\\Users\\1111\\AppData\\Local\\Android\\Sdk
"@
    $content | Out-File -FilePath $localPropertiesPath -Encoding UTF8
    Write-Host "   local.properties file created" -ForegroundColor Green
}

# 5. Summary
Write-Host "`n5. Summary..." -ForegroundColor Yellow
Write-Host "   Please sync project in Android Studio" -ForegroundColor Cyan
Write-Host "   Click: File -> Sync Project with Gradle Files" -ForegroundColor Cyan

Write-Host "`n=== Configuration Fix Complete ===" -ForegroundColor Green
Write-Host "If there are still issues, please screenshot the errors" -ForegroundColor Cyan
