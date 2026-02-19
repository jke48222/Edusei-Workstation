@echo off
REM Batch script to create transition videos with transparent backgrounds
REM Requires ffmpeg to be installed and in PATH

setlocal enabledelayedexpansion

set "SCRIPT_DIR=%~dp0"
set "PROJECT_ROOT=%SCRIPT_DIR%.."
set "VIDEOS_DIR=%PROJECT_ROOT%\public\videos"
set "BLACK_VIDEO=%VIDEOS_DIR%\jalen-edusei-black.webm"
set "WHITE_VIDEO=%VIDEOS_DIR%\jalen-edusei-white.webm"
set "OUTPUT1=%VIDEOS_DIR%\jalen-edusei-transition-1.webm"
set "OUTPUT2=%VIDEOS_DIR%\jalen-edusei-transition-2.webm"

REM Check if ffmpeg is available
where ffmpeg >nul 2>&1
if errorlevel 1 (
    echo Error: ffmpeg is not installed or not in PATH
    echo Please install ffmpeg from https://ffmpeg.org/download.html
    exit /b 1
)

REM Check if input videos exist
if not exist "%BLACK_VIDEO%" (
    echo Error: Black video not found at %BLACK_VIDEO%
    exit /b 1
)

if not exist "%WHITE_VIDEO%" (
    echo Error: White video not found at %WHITE_VIDEO%
    exit /b 1
)

echo Creating transition videos with transparent backgrounds...
echo.

REM Create temp directory
set "TEMP_DIR=%TEMP%\video_transitions"
if not exist "%TEMP_DIR%" mkdir "%TEMP_DIR%"

REM Create Transition Video 1: black [0-1s] + white [1s-end]
echo Creating Transition 1 (black-^>white)...
echo   Creating transition video (preserving alpha)...
ffmpeg -c:v libvpx-vp9 -i "%BLACK_VIDEO%" -c:v libvpx-vp9 -i "%WHITE_VIDEO%" -filter_complex "[0:v]format=yuva420p,trim=start=0:end=1.00,setpts=PTS-STARTPTS[v0];[1:v]format=yuva420p,trim=start=1.00,setpts=PTS-STARTPTS[v1];[v0][v1]concat=n=2:v=1:a=0[outv]" -map "[outv]" -c:v libvpx-vp9 -pix_fmt yuva420p -b:v 0 -crf 30 -auto-alt-ref 0 -row-mt 1 -an -y "%OUTPUT1%" >nul 2>&1
if errorlevel 1 (
    echo   [ERROR] Failed to create transition video
    goto :cleanup
)

echo   [OK] Created: %OUTPUT1%
echo.

REM Create Transition Video 2: white [0-1s] + black [1s-end]
echo Creating Transition 2 (white-^>black)...
echo   Creating transition video (preserving alpha)...
ffmpeg -c:v libvpx-vp9 -i "%WHITE_VIDEO%" -c:v libvpx-vp9 -i "%BLACK_VIDEO%" -filter_complex "[0:v]format=yuva420p,trim=start=0:end=1.00,setpts=PTS-STARTPTS[v0];[1:v]format=yuva420p,trim=start=1.00,setpts=PTS-STARTPTS[v1];[v0][v1]concat=n=2:v=1:a=0[outv]" -map "[outv]" -c:v libvpx-vp9 -pix_fmt yuva420p -b:v 0 -crf 30 -auto-alt-ref 0 -row-mt 1 -an -y "%OUTPUT2%" >nul 2>&1
if errorlevel 1 (
    echo   [ERROR] Failed to create transition video
    goto :cleanup
)

echo   [OK] Created: %OUTPUT2%
echo.

echo All transition videos created successfully!
echo   - %OUTPUT1%
echo   - %OUTPUT2%

:cleanup
REM Cleanup temp files
if exist "%TEMP_DIR%" rmdir /s /q "%TEMP_DIR%" 2>nul

endlocal
