# PowerShell script to convert WebM videos to stacked-alpha format
# This works on Windows and produces smaller files than HEVC
# Uses AV1 (best) and HEVC (fallback) codecs

$ErrorActionPreference = "Stop"

# Paths
$SCRIPT_DIR = Split-Path -Parent $MyInvocation.MyCommand.Path
$PROJECT_ROOT = Split-Path -Parent $SCRIPT_DIR
$VIDEOS_DIR = Join-Path $PROJECT_ROOT "public\videos"
$OUTPUT_DIR = Join-Path $VIDEOS_DIR "stacked-alpha"

# Check if ffmpeg is available
try {
    $null = Get-Command ffmpeg -ErrorAction Stop
} catch {
    Write-Host "Error: ffmpeg is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install ffmpeg from https://ffmpeg.org/download.html" -ForegroundColor Yellow
    exit 1
}

Write-Host "Converting WebM videos to stacked-alpha format..." -ForegroundColor Green
Write-Host "This format works on all platforms including iOS Safari!" -ForegroundColor Cyan
Write-Host ""

# Create output directory
if (-not (Test-Path $OUTPUT_DIR)) {
    New-Item -ItemType Directory -Force -Path $OUTPUT_DIR | Out-Null
}

# List of videos to convert
$videos = @(
    @{ Input = "jalen-edusei-black.webm"; BaseName = "jalen-edusei-black" },
    @{ Input = "jalen-edusei-white.webm"; BaseName = "jalen-edusei-white" },
    @{ Input = "jalen-edusei-transition-1.webm"; BaseName = "jalen-edusei-transition-1" },
    @{ Input = "jalen-edusei-transition-2.webm"; BaseName = "jalen-edusei-transition-2" }
)

# Filter complex for stacked-alpha: color on top, alpha on bottom
$filterComplex = "[0:v]format=pix_fmts=yuva444p[main]; [main]split[main][alpha]; [alpha]alphaextract[alpha]; [main][alpha]vstack"

foreach ($video in $videos) {
    $inputPath = Join-Path $VIDEOS_DIR $video.Input
    
    if (-not (Test-Path $inputPath)) {
        Write-Host "  [SKIP] Input not found: $($video.Input)" -ForegroundColor Yellow
        continue
    }
    
    Write-Host "Converting: $($video.Input)..." -ForegroundColor Cyan
    
    # Get absolute paths
    $inputPathAbs = (Resolve-Path $inputPath).Path -replace '\\', '/'
    
    # AV1 version (best quality, smallest size, works on modern devices)
    $av1Output = Join-Path $OUTPUT_DIR "$($video.BaseName)_av1.mp4"
    $av1OutputAbs = (Resolve-Path (Split-Path $av1Output -Parent)).Path -replace '\\', '/' | Join-Path -ChildPath (Split-Path $av1Output -Leaf)
    
    Write-Host "  Creating AV1 version..." -ForegroundColor Gray
    
    # Two-pass encoding for AV1
    $pass1Log = Join-Path $env:TEMP "ffmpeg_pass1_$($video.BaseName).log"
    $pass2Log = Join-Path $env:TEMP "ffmpeg_pass2_$($video.BaseName).log"
    
    # Pass 1
    $process1 = Start-Process -FilePath "ffmpeg" `
        -ArgumentList @(
            "-c:v", "libvpx-vp9",
            "-i", "`"$inputPathAbs`"",
            "-filter_complex", $filterComplex,
            "-pix_fmt", "yuv420p",
            "-an",
            "-c:v", "libaom-av1",
            "-cpu-used", "3",
            "-crf", "45",
            "-pass", "1",
            "-f", "null",
            "/dev/null"
        ) `
        -Wait `
        -PassThru `
        -NoNewWindow `
        -RedirectStandardError $pass1Log
    
    if ($process1.ExitCode -ne 0) {
        Write-Host "    [ERROR] Pass 1 failed" -ForegroundColor Red
        continue
    }
    
    # Pass 2
    $process2 = Start-Process -FilePath "ffmpeg" `
        -ArgumentList @(
            "-c:v", "libvpx-vp9",
            "-i", "`"$inputPathAbs`"",
            "-filter_complex", $filterComplex,
            "-pix_fmt", "yuv420p",
            "-an",
            "-c:v", "libaom-av1",
            "-cpu-used", "3",
            "-crf", "45",
            "-pass", "2",
            "-movflags", "+faststart",
            "-y",
            "`"$av1OutputAbs`""
        ) `
        -Wait `
        -PassThru `
        -NoNewWindow `
        -RedirectStandardError $pass2Log
    
    if ($process2.ExitCode -ne 0) {
        $errorLog = Get-Content $pass2Log -ErrorAction SilentlyContinue
        Write-Host "    [ERROR] Pass 2 failed: $errorLog" -ForegroundColor Red
        continue
    }
    
    Write-Host "    [OK] AV1: $av1Output" -ForegroundColor Green
    
    # HEVC version (fallback for older devices)
    $hevcOutput = Join-Path $OUTPUT_DIR "$($video.BaseName)_hevc.mp4"
    $hevcOutputAbs = (Resolve-Path (Split-Path $hevcOutput -Parent)).Path -replace '\\', '/' | Join-Path -ChildPath (Split-Path $hevcOutput -Leaf)
    
    Write-Host "  Creating HEVC version..." -ForegroundColor Gray
    
    $process3 = Start-Process -FilePath "ffmpeg" `
        -ArgumentList @(
            "-c:v", "libvpx-vp9",
            "-i", "`"$inputPathAbs`"",
            "-filter_complex", $filterComplex,
            "-pix_fmt", "yuv420p",
            "-an",
            "-c:v", "libx265",
            "-preset", "veryslow",
            "-crf", "30",
            "-tag:v", "hvc1",
            "-movflags", "+faststart",
            "-y",
            "`"$hevcOutputAbs`""
        ) `
        -Wait `
        -PassThru `
        -NoNewWindow `
        -RedirectStandardError "$env:TEMP\ffmpeg_hevc_$($video.BaseName).log"
    
    if ($process3.ExitCode -ne 0) {
        Write-Host "    [WARN] HEVC encoding failed (may not be available)" -ForegroundColor Yellow
    } else {
        Write-Host "    [OK] HEVC: $hevcOutput" -ForegroundColor Green
    }
    
    Write-Host ""
}

Write-Host "All stacked-alpha videos created successfully!" -ForegroundColor Green
Write-Host "Output directory: $OUTPUT_DIR" -ForegroundColor Gray
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Install stacked-alpha-video: npm install stacked-alpha-video" -ForegroundColor White
Write-Host "2. Update HeroVideoTitle.tsx to use the stacked-alpha-video component" -ForegroundColor White
Write-Host "3. See scripts/README_STACKED_ALPHA.md for usage instructions" -ForegroundColor White
