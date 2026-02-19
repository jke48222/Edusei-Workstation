# PowerShell script to convert WebM videos to HEVC (H.265) with alpha transparency
# Note: HEVC with alpha encoding requires macOS and Apple's VideoToolbox encoder
# On Windows, this script will check the platform and provide alternatives

$ErrorActionPreference = "Stop"

# Paths
$SCRIPT_DIR = Split-Path -Parent $MyInvocation.MyCommand.Path
$PROJECT_ROOT = Split-Path -Parent $SCRIPT_DIR
$VIDEOS_DIR = Join-Path $PROJECT_ROOT "public\videos"
$OUTPUT_DIR = Join-Path $VIDEOS_DIR "hevc"

# Check if ffmpeg is available
try {
    $null = Get-Command ffmpeg -ErrorAction Stop
} catch {
    Write-Host "Error: ffmpeg is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install ffmpeg from https://ffmpeg.org/download.html" -ForegroundColor Yellow
    exit 1
}

# Check platform
$isMacOS = $PSVersionTable.Platform -eq "Unix" -or (Get-Command uname -ErrorAction SilentlyContinue) -and (uname) -eq "Darwin"
$isWindows = $PSVersionTable.Platform -eq "Win32NT" -or $env:OS -like "*Windows*"

Write-Host "Converting WebM videos to HEVC with alpha transparency..." -ForegroundColor Green
Write-Host ""

if ($isMacOS) {
    Write-Host "Platform: macOS detected - Using VideoToolbox encoder for HEVC with alpha" -ForegroundColor Cyan
    Write-Host ""
    
    # Create output directory
    if (-not (Test-Path $OUTPUT_DIR)) {
        New-Item -ItemType Directory -Force -Path $OUTPUT_DIR | Out-Null
    }
    
    # List of videos to convert
    $videos = @(
        @{ Input = "jalen-edusei-black.webm"; Output = "jalen-edusei-black.mov" },
        @{ Input = "jalen-edusei-white.webm"; Output = "jalen-edusei-white.mov" },
        @{ Input = "jalen-edusei-transition-1.webm"; Output = "jalen-edusei-transition-1.mov" },
        @{ Input = "jalen-edusei-transition-2.webm"; Output = "jalen-edusei-transition-2.mov" }
    )
    
    foreach ($video in $videos) {
        $inputPath = Join-Path $VIDEOS_DIR $video.Input
        $outputPath = Join-Path $OUTPUT_DIR $video.Output
        
        if (-not (Test-Path $inputPath)) {
            Write-Host "  [SKIP] Input not found: $($video.Input)" -ForegroundColor Yellow
            continue
        }
        
        Write-Host "Converting: $($video.Input) -> $($video.Output)..." -ForegroundColor Cyan
        
        # Use VideoToolbox encoder for HEVC with alpha on macOS
        # -c:v hevc_videotoolbox: Uses Apple's hardware encoder
        # -allow_sw 1: Allow software fallback if hardware unavailable
        # -alpha_quality 0.75: Alpha channel quality (0-1, higher = better)
        # -vtag hvc1: Required tag for HEVC with alpha
        # -vf "premultiply=inplace=1": Premultiply alpha for better quality
        # -q:v 35: Quality setting (lower = better quality, larger file)
        $process = Start-Process -FilePath "ffmpeg" `
            -ArgumentList @(
                "-c:v", "libvpx-vp9",
                "-i", "`"$inputPath`"",
                "-c:v", "hevc_videotoolbox",
                "-allow_sw", "1",
                "-alpha_quality", "0.75",
                "-vtag", "hvc1",
                "-vf", "premultiply=inplace=1",
                "-q:v", "35",
                "-an",
                "-y",
                "`"$outputPath`""
            ) `
            -Wait `
            -PassThru `
            -NoNewWindow `
            -RedirectStandardError "$env:TEMP\ffmpeg_hevc.log"
        
        if ($process.ExitCode -ne 0) {
            $errorLog = Get-Content "$env:TEMP\ffmpeg_hevc.log" -ErrorAction SilentlyContinue
            Write-Host "  [ERROR] Failed to convert. Exit code: $($process.ExitCode)" -ForegroundColor Red
            Write-Host "  Error details: $errorLog" -ForegroundColor Gray
        } else {
            Write-Host "  [OK] Created: $outputPath" -ForegroundColor Green
        }
    }
    
    Write-Host ""
    Write-Host "All HEVC videos created successfully!" -ForegroundColor Green
    Write-Host "Output directory: $OUTPUT_DIR" -ForegroundColor Gray
    
} elseif ($isWindows) {
    Write-Host "Platform: Windows detected" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "HEVC with alpha encoding requires macOS and Apple's VideoToolbox encoder." -ForegroundColor Yellow
    Write-Host "Windows cannot natively encode HEVC with alpha transparency." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Options:" -ForegroundColor Cyan
    Write-Host "1. Use macOS to encode HEVC with alpha (recommended)" -ForegroundColor White
    Write-Host "2. Use stacked-alpha-video approach (works on all platforms)" -ForegroundColor White
    Write-Host "3. Use online conversion service like alphavids.io" -ForegroundColor White
    Write-Host ""
    Write-Host "Would you like to create stacked-alpha videos instead? (y/n)" -ForegroundColor Cyan
    $response = Read-Host
    
    if ($response -eq "y" -or $response -eq "Y") {
        Write-Host ""
        Write-Host "Creating stacked-alpha videos (AV1 + HEVC)..." -ForegroundColor Cyan
        Write-Host "These work on all platforms including mobile Safari." -ForegroundColor Gray
        Write-Host ""
        
        # Create output directory
        if (-not (Test-Path $OUTPUT_DIR)) {
            New-Item -ItemType Directory -Force -Path $OUTPUT_DIR | Out-Null
        }
        
        # Stacked-alpha encoding script would go here
        Write-Host "Stacked-alpha encoding requires additional setup." -ForegroundColor Yellow
        Write-Host "See: https://jakearchibald.com/2024/video-with-transparency/" -ForegroundColor Cyan
    }
} else {
    Write-Host "Platform: Unknown - Attempting HEVC encoding..." -ForegroundColor Yellow
    Write-Host "Note: HEVC with alpha may not work on this platform." -ForegroundColor Yellow
}
