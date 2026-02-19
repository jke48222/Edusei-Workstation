# Video Export Guide for Blender Animation

## Step 1: Export Video from Blender

### Option A: Using the Script (Recommended)
```bash
blender ../../jalenedusei.blend --background --python scripts/blender_export_video.py
```

This will:
- Render frames 1-250 (or your scene's frame range)
- Export as PNG sequence with transparent background
- Save to `public/videos/jalenedusei_animation_0001.png`, etc.

### Option B: Manual Export in Blender UI
1. Open your Blender scene
2. Go to **Properties → Render Properties**
3. Set **Film → Transparent** to ON (enables alpha channel)
4. Set **Output Properties → File Format** to **PNG** (or **FFmpeg video**)
5. Set **Color** to **RGBA** (for PNG) or **RGB** (for video)
6. Set output path to `public/videos/jalenedusei_animation_`
7. Click **Render → Render Animation**

## Step 2: Convert PNG Sequence to Video with Transparency

### Using FFmpeg (Recommended)

**For WebM (best browser support, smaller file size):**
```bash
cd public/videos
ffmpeg -i jalenedusei_animation_%04d.png -c:v libvpx-vp9 -pix_fmt yuva420p -auto-alt-ref 0 jalenedusei.webm
```

**For MP4 (H.264 with alpha - limited support):**
```bash
ffmpeg -i jalenedusei_animation_%04d.png -c:v libx264 -pix_fmt yuva420p -crf 18 jalenedusei.mp4
```

**For MOV (ProRes 4444 - best quality, large file):**
```bash
ffmpeg -i jalenedusei_animation_%04d.png -c:v prores_ks -pix_fmt yuva444p10le jalenedusei.mov
```

### Using Online Tools
1. Upload PNG sequence to a service like:
   - CloudConvert (cloudconvert.com)
   - Ezgif (ezgif.com)
   - Remove.bg (for single frames, then combine)

## Step 3: Remove Background (if not already transparent)

If your video still has a background:

### Using FFmpeg with chromakey (if background is solid color):
```bash
# Remove white background
ffmpeg -i input.mp4 -vf "chromakey=0xFFFFFF:0.1:0.2" -c:v libvpx-vp9 -pix_fmt yuva420p output.webm

# Remove black background  
ffmpeg -i input.mp4 -vf "chromakey=0x000000:0.1:0.2" -c:v libvpx-vp9 -pix_fmt yuva420p output.webm
```

### Using After Effects / Premiere Pro:
1. Import video
2. Apply "Keylight" or "Ultra Key" effect
3. Select background color
4. Export as MOV with alpha channel (ProRes 4444)

## Recommended Settings for Web

- **Format**: WebM (VP9) with alpha channel
- **Resolution**: Match your design (e.g., 1920x1080 or your canvas size)
- **Frame Rate**: 30fps or 60fps (match your Blender timeline)
- **Quality**: Balance file size vs quality (CRF 18-23 for VP9)

## File Size Optimization

For smaller file sizes:
```bash
# Lower quality (smaller file)
ffmpeg -i jalenedusei_animation_%04d.png -c:v libvpx-vp9 -pix_fmt yuva420p -crf 35 -b:v 0 jalenedusei.webm

# Higher quality (larger file)
ffmpeg -i jalenedusei_animation_%04d.png -c:v libvpx-vp9 -pix_fmt yuva420p -crf 15 -b:v 0 jalenedusei.webm
```
