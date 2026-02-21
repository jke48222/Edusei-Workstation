# ngrok Setup Helper
# This script helps you configure ngrok with your auth token

param(
    [string]$AuthToken,
    [string]$NgrokPath = "$env:USERPROFILE\Downloads\ngrok.exe"
)

Write-Host "ngrok Setup Helper" -ForegroundColor Cyan
Write-Host "==================" -ForegroundColor Cyan
Write-Host ""

# Check if ngrok exists
if (-not (Test-Path $NgrokPath)) {
    Write-Host "[ERROR] ngrok.exe not found at: $NgrokPath" -ForegroundColor Red
    Write-Host ""
    Write-Host "Downloading ngrok..." -ForegroundColor Yellow
    
    $downloadUrl = "https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-windows-amd64.zip"
    $zipPath = "$env:USERPROFILE\Downloads\ngrok.zip"
    
    try {
        Invoke-WebRequest -Uri $downloadUrl -OutFile $zipPath
        Expand-Archive -Path $zipPath -DestinationPath "$env:USERPROFILE\Downloads" -Force
        Remove-Item $zipPath -Force
        Write-Host "[OK] ngrok downloaded successfully!" -ForegroundColor Green
    } catch {
        Write-Host "[ERROR] Failed to download ngrok: $_" -ForegroundColor Red
        Write-Host "Please download manually from: https://ngrok.com/download" -ForegroundColor Yellow
        exit 1
    }
}

# If auth token provided, configure it
if ($AuthToken) {
    Write-Host "Configuring ngrok with auth token..." -ForegroundColor Cyan
    & $NgrokPath config add-authtoken $AuthToken
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] ngrok configured successfully!" -ForegroundColor Green
    } else {
        Write-Host "[ERROR] Failed to configure ngrok" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "[INFO] No auth token provided." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "To get your auth token:" -ForegroundColor Cyan
    Write-Host "1. Sign up/login at: https://dashboard.ngrok.com/get-started/signup" -ForegroundColor White
    Write-Host "2. Get your token from: https://dashboard.ngrok.com/get-started/your-authtoken" -ForegroundColor White
    Write-Host "3. Run this script with: .\scripts\setup_ngrok.ps1 -AuthToken YOUR_TOKEN" -ForegroundColor White
    Write-Host ""
    Write-Host "Or configure manually:" -ForegroundColor Cyan
    Write-Host "  & '$NgrokPath' config add-authtoken YOUR_AUTH_TOKEN" -ForegroundColor White
}

Write-Host ""
Write-Host "Setup complete! To start a tunnel, run:" -ForegroundColor Green
Write-Host "  .\scripts\start_ngrok.ps1" -ForegroundColor White
