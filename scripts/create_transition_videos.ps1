# PowerShell script to create transition videos with transparent backgrounds
# Requires ffmpeg to be installed and in PATH

$ErrorActionPreference = "Stop"

# Paths
$projectRoot = Split-Path -Parent $PSScriptRoot
$videosDir = Join-Path $projectRoot "public\videos"
$blackVideo = Join-Path $videosDir "jalen-edusei-black.webm"
$whiteVideo = Join-Path $videosDir "jalen-edusei-white.webm"
$output1 = Join-Path $videosDir "jalen-edusei-transition-1.webm"
$output2 = Join-Path $videosDir "jalen-edusei-transition-2.webm"

# Check if ffmpeg is available
try {
    $null = Get-Command ffmpeg -ErrorAction Stop
} catch {
    Write-Host "Error: ffmpeg is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install ffmpeg from https://ffmpeg.org/download.html" -ForegroundColor Yellow
    exit 1
}

# Check if input videos exist
if (-not (Test-Path $blackVideo)) {
    Write-Host "Error: Black video not found at $blackVideo" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $whiteVideo)) {
    Write-Host "Error: White video not found at $whiteVideo" -ForegroundColor Red
    exit 1
}

Write-Host "Creating transition videos with transparent backgrounds..." -ForegroundColor Green
Write-Host ""

# Function to create a transition video
function Create-TransitionVideo {
    param(
        [string]$firstVideo,
        [string]$secondVideo,
        [string]$outputPath,
        [string]$description
    )
    
    Write-Host "Creating $description..." -ForegroundColor Cyan
    
    # Create temporary files for the segments
    $tempDir = Join-Path $env:TEMP "video_transitions"
    New-Item -ItemType Directory -Force -Path $tempDir | Out-Null
    
    $segment1 = Join-Path $tempDir "segment1.webm"
    $segment2 = Join-Path $tempDir "segment2.webm"
    $concatList = Join-Path $tempDir "concat.txt"
    
    try {
        # Use filter_complex to do everything in one pass - this better preserves alpha
        # Read both videos, extract segments, and concatenate while maintaining alpha throughout
        Write-Host "  Creating transition video (preserving alpha)..." -ForegroundColor Gray
        
        # Get absolute paths with forward slashes for ffmpeg
        $firstVideoAbs = (Resolve-Path $firstVideo).Path -replace '\\', '/'
        $secondVideoAbs = (Resolve-Path $secondVideo).Path -replace '\\', '/'
        
        # Filter complex: 
        # 1. Read first video, convert to yuva420p to ensure alpha is read, trim to 0-1s
        # 2. Read second video, convert to yuva420p to ensure alpha is read, trim from 1s to end
        # 3. Concatenate both segments
        # CRITICAL: Use -c:v libvpx-vp9 BEFORE -i to force libvpx decoder - this properly reads VP9 alpha channel
        $filterComplex = "[0:v]format=yuva420p,trim=start=0:end=1.00,setpts=PTS-STARTPTS[v0];[1:v]format=yuva420p,trim=start=1.00,setpts=PTS-STARTPTS[v1];[v0][v1]concat=n=2:v=1:a=0[outv]"
        
        $process = Start-Process -FilePath "ffmpeg" `
            -ArgumentList @(
                "-c:v", "libvpx-vp9",
                "-i", "`"$firstVideoAbs`"",
                "-c:v", "libvpx-vp9",
                "-i", "`"$secondVideoAbs`"",
                "-filter_complex", $filterComplex,
                "-map", "[outv]",
                "-c:v", "libvpx-vp9",
                "-pix_fmt", "yuva420p",
                "-b:v", "0",
                "-crf", "30",
                "-auto-alt-ref", "0",
                "-row-mt", "1",
                "-an",
                "-y",
                "`"$outputPath`""
            ) `
            -Wait `
            -PassThru `
            -NoNewWindow `
            -RedirectStandardError "$tempDir\ffmpeg.log"
        
        if ($process.ExitCode -ne 0) {
            $errorLog = Get-Content "$tempDir\ffmpeg.log" -ErrorAction SilentlyContinue
            throw "Failed to create transition video. Exit code: $($process.ExitCode). Error: $errorLog"
        }
        
        Write-Host "  [OK] Created: $outputPath" -ForegroundColor Green
        
    } catch {
        Write-Host "  [ERROR] $_" -ForegroundColor Red
        throw
    } finally {
        # Cleanup temp files
        if (Test-Path $tempDir) {
            Remove-Item -Recurse -Force $tempDir -ErrorAction SilentlyContinue
        }
    }
}

# Create Transition Video 1: black [0-1s] + white [1s-end]
Create-TransitionVideo `
    -firstVideo $blackVideo `
    -secondVideo $whiteVideo `
    -outputPath $output1 `
    -description "Transition 1 (black→white)"

Write-Host ""

# Create Transition Video 2: white [0-1s] + black [1s-end]
Create-TransitionVideo `
    -firstVideo $whiteVideo `
    -secondVideo $blackVideo `
    -outputPath $output2 `
    -description "Transition 2 (white→black)"

Write-Host ""
Write-Host "All transition videos created successfully!" -ForegroundColor Green
Write-Host "  - $output1" -ForegroundColor Gray
Write-Host "  - $output2" -ForegroundColor Gray
