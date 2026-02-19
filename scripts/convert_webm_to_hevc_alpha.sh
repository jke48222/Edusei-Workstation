#!/bin/bash
# Bash script to convert WebM videos to HEVC (H.265) with alpha transparency
# Requires macOS with Apple's VideoToolbox encoder

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
VIDEOS_DIR="$PROJECT_ROOT/public/videos"
OUTPUT_DIR="$VIDEOS_DIR/hevc"

# Check if ffmpeg is available
if ! command -v ffmpeg &> /dev/null; then
    echo "Error: ffmpeg is not installed or not in PATH"
    echo "Install with: brew install ffmpeg"
    exit 1
fi

# Check if running on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo "Error: This script requires macOS for HEVC with alpha encoding"
    echo "HEVC with alpha uses Apple's VideoToolbox encoder which is macOS-only"
    exit 1
fi

echo "Converting WebM videos to HEVC with alpha transparency..."
echo "Platform: macOS - Using VideoToolbox encoder"
echo ""

# Create output directory
mkdir -p "$OUTPUT_DIR"

# List of videos to convert
declare -a videos=(
    "jalen-edusei-black.webm:jalen-edusei-black.mov"
    "jalen-edusei-white.webm:jalen-edusei-white.mov"
    "jalen-edusei-transition-1.webm:jalen-edusei-transition-1.mov"
    "jalen-edusei-transition-2.webm:jalen-edusei-transition-2.mov"
)

for video_pair in "${videos[@]}"; do
    IFS=':' read -r input_file output_file <<< "$video_pair"
    input_path="$VIDEOS_DIR/$input_file"
    output_path="$OUTPUT_DIR/$output_file"
    
    if [ ! -f "$input_path" ]; then
        echo "  [SKIP] Input not found: $input_file"
        continue
    fi
    
    echo "Converting: $input_file -> $output_file..."
    
    # Use VideoToolbox encoder for HEVC with alpha
    # -c:v hevc_videotoolbox: Uses Apple's hardware encoder
    # -allow_sw 1: Allow software fallback if hardware unavailable
    # -alpha_quality 0.75: Alpha channel quality (0-1, higher = better)
    # -vtag hvc1: Required tag for HEVC with alpha
    # -vf "premultiply=inplace=1": Premultiply alpha for better quality
    # -q:v 35: Quality setting (lower = better quality, larger file)
    if ffmpeg -c:v libvpx-vp9 -i "$input_path" \
        -c:v hevc_videotoolbox \
        -allow_sw 1 \
        -alpha_quality 0.75 \
        -vtag hvc1 \
        -vf "premultiply=inplace=1" \
        -q:v 35 \
        -an \
        -y \
        "$output_path" 2>&1 | grep -v "frame=" | grep -v "size=" | grep -v "time=" | grep -v "bitrate=" | grep -v "speed="; then
        echo "  [OK] Created: $output_path"
    else
        echo "  [ERROR] Failed to convert: $input_file"
        exit 1
    fi
done

echo ""
echo "All HEVC videos created successfully!"
echo "Output directory: $OUTPUT_DIR"
