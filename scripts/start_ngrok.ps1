# ngrok Tunnel Starter for Development
# This script starts an ngrok tunnel to your local dev server

param(
    [int]$Port = 5173,
    [string]$NgrokPath = "$env:USERPROFILE\Downloads\ngrok.exe",
    [string]$Domain = ""
)

Write-Host "Starting ngrok tunnel..." -ForegroundColor Cyan
Write-Host "Port: $Port" -ForegroundColor Gray
Write-Host ""

# Check if ngrok exists
if (-not (Test-Path $NgrokPath)) {
    Write-Host "[ERROR] ngrok.exe not found at: $NgrokPath" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please download ngrok from: https://ngrok.com/download" -ForegroundColor Yellow
    Write-Host "Or update the NgrokPath parameter in this script." -ForegroundColor Yellow
    exit 1
}

# Check if auth token is configured
# ngrok stores config in LOCALAPPDATA on Windows
$configPath = "$env:LOCALAPPDATA\ngrok\ngrok.yml"
if (-not (Test-Path $configPath)) {
    Write-Host "[WARNING] ngrok auth token not configured!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "To configure ngrok:" -ForegroundColor Cyan
    Write-Host "1. Sign up at https://dashboard.ngrok.com/get-started/signup" -ForegroundColor White
    Write-Host "2. Get your authtoken from https://dashboard.ngrok.com/get-started/your-authtoken" -ForegroundColor White
    Write-Host "3. Run: & '$NgrokPath' config add-authtoken YOUR_AUTH_TOKEN" -ForegroundColor White
    Write-Host ""
    exit 1
}

# Build ngrok command
$ngrokArgs = @("http", $Port)
if ($Domain) {
    $ngrokArgs += "--domain=$Domain"
    Write-Host "Using domain: $Domain" -ForegroundColor Gray
    Write-Host ""
}

# Start ngrok
Write-Host "Tunnel starting... Open the URL shown below on your mobile device." -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the tunnel." -ForegroundColor Gray
Write-Host ""
Write-Host "Note: If you see a 'dev domain' error, visit https://dashboard.ngrok.com/domains" -ForegroundColor Yellow
Write-Host "      to set up your free dev domain, then use: .\scripts\start_ngrok.ps1 -Domain YOUR_DOMAIN" -ForegroundColor Yellow
Write-Host ""

& $NgrokPath $ngrokArgs
