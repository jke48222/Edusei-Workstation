# Transition Video Creation Scripts

These scripts create transition videos by combining segments from two source videos (black and white variants) while preserving transparency.

## What They Do

- **Transition 1**: Black video [0-1s] + White video [1s-end]
- **Transition 2**: White video [0-1s] + Black video [1s-end]

## Requirements

- ffmpeg installed and in PATH
- Source videos: `jalen-edusei-black.webm` and `jalen-edusei-white.webm` in `public/videos/`

## Usage

### PowerShell (Windows)
```powershell
powershell -ExecutionPolicy Bypass -File scripts/create_transition_videos.ps1
```

### Batch (Windows)
```cmd
scripts\create_transition_videos.bat
```

## Transparency Preservation

The scripts use the following ffmpeg settings to preserve transparency:

- **Codec**: `libvpx-vp9` (VP9 codec with alpha channel support)
- **Pixel Format**: `yuva420p` (YUV 4:2:0 with alpha channel)
- **Quality**: CRF 30 (good balance of quality and file size)
- **Other settings**: 
  - `-auto-alt-ref 0`: Disables alternate reference frames for better alpha handling
  - `-row-mt 1`: Enables row-based multi-threading for faster encoding
  - `-an`: Removes audio (videos are silent)

## Verifying Transparency

To verify that transparency is preserved:

1. **Check pixel format** (may show yuv420p even with alpha):
   ```bash
   ffprobe -v error -select_streams v:0 -show_entries stream=pix_fmt,codec_name output.webm
   ```

2. **Extract a frame and check in an image editor**:
   ```bash
   ffmpeg -i output.webm -frames:v 1 -vf "select=eq(n\,0)" test_frame.png
   ```
   Open `test_frame.png` in an image editor and verify the background is transparent.

3. **Test in browser**: Load the video in an HTML page with a colored background to see if transparency shows through.

## Output Files

- `public/videos/jalen-edusei-transition-1.webm`
- `public/videos/jalen-edusei-transition-2.webm`

## Troubleshooting

### "ffmpeg is not installed"
Install ffmpeg from https://ffmpeg.org/download.html and ensure it's in your PATH.

### "Failed to extract segment"
- Check that source videos exist and are valid WebM files
- Verify ffmpeg has VP9 codec support (run `ffmpeg -codecs | findstr vp9`)

### Transparency not preserved
- Ensure source videos have transparent backgrounds
- Check that VP9 codec with alpha is available: `ffmpeg -codecs | findstr vp9`
- Try opening the output in a browser or image editor to verify transparency
