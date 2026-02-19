# HEVC (H.265) with Alpha Transparency Conversion

This guide explains how to convert WebM videos with alpha transparency to HEVC format for mobile Safari support.

## Platform Requirements

**HEVC with alpha encoding requires macOS** because it uses Apple's VideoToolbox hardware encoder, which is only available on macOS.

## Quick Start (macOS)

### Using the Bash Script

```bash
chmod +x scripts/convert_webm_to_hevc_alpha.sh
./scripts/convert_webm_to_hevc_alpha.sh
```

### Using PowerShell (macOS)

```powershell
powershell -ExecutionPolicy Bypass -File scripts/convert_webm_to_hevc_alpha.ps1
```

## Manual Conversion (macOS)

For each video file:

```bash
ffmpeg -c:v libvpx-vp9 -i input.webm \
  -c:v hevc_videotoolbox \
  -allow_sw 1 \
  -alpha_quality 0.75 \
  -vtag hvc1 \
  -vf "premultiply=inplace=1" \
  -q:v 35 \
  -an \
  -y \
  output.mov
```

### Parameters Explained

- `-c:v libvpx-vp9`: Use VP9 decoder to properly read alpha from WebM
- `-c:v hevc_videotoolbox`: Use Apple's hardware HEVC encoder
- `-allow_sw 1`: Allow software fallback if hardware unavailable
- `-alpha_quality 0.75`: Alpha channel quality (0-1, higher = better, larger file)
- `-vtag hvc1`: Required tag for HEVC with alpha (Apple extension)
- `-vf "premultiply=inplace=1"`: Premultiply alpha for better quality
- `-q:v 35`: Quality setting (lower = better quality, larger file)
- `-an`: Remove audio

## Windows Alternative

Since Windows cannot encode HEVC with alpha natively, you have these options:

### Option 1: Use macOS
- Transfer files to a Mac
- Run the conversion script there
- Transfer the `.mov` files back

### Option 2: Use Stacked-Alpha Video
This approach works on all platforms and results in smaller files:

1. Install the `stacked-alpha-video` package:
   ```bash
   npm install stacked-alpha-video
   ```

2. Convert videos to stacked format (color on top, alpha on bottom):
   ```bash
   # AV1 version (best quality, smallest size)
   ffmpeg -i input.webm \
     -filter_complex "[0:v]format=pix_fmts=yuva444p[main]; [main]split[main][alpha]; [alpha]alphaextract[alpha]; [main][alpha]vstack" \
     -pix_fmt yuv420p \
     -an \
     -c:v libaom-av1 \
     -cpu-used 3 \
     -crf 45 \
     -pass 1 -f null /dev/null && \
   ffmpeg -i input.webm \
     -filter_complex "[0:v]format=pix_fmts=yuva444p[main]; [main]split[main][alpha]; [alpha]alphaextract[alpha]; [main][alpha]vstack" \
     -pix_fmt yuv420p \
     -an \
     -c:v libaom-av1 \
     -cpu-used 3 \
     -crf 45 \
     -pass 2 \
     -movflags +faststart \
     output_av1.mp4
   
   # HEVC version (for older devices)
   ffmpeg -i input.webm \
     -filter_complex "[0:v]format=pix_fmts=yuva444p[main]; [main]split[main][alpha]; [alpha]alphaextract[alpha]; [main][alpha]vstack" \
     -pix_fmt yuv420p \
     -an \
     -c:v libx265 \
     -preset veryslow \
     -crf 30 \
     -tag:v hvc1 \
     -movflags +faststart \
     output_hevc.mp4
   ```

3. Use the web component in your React app:
   ```tsx
   import 'stacked-alpha-video';
   
   <stacked-alpha-video>
     <video autoplay muted playsinline loop>
       <source src="video_av1.mp4" type="video/mp4; codecs=av01.0.08M.08.0.110.01.01.01.1" />
       <source src="video_hevc.mp4" type="video/mp4; codecs=hvc1.1.6.H120.b0" />
     </video>
   </stacked-alpha-video>
   ```

### Option 3: Online Conversion
Use services like [alphavids.io](https://alphavids.io) to convert WebM to HEVC with alpha.

## Using HEVC Videos in Your App

After conversion, update `HeroVideoTitle.tsx` to use dual-source video:

```tsx
<video>
  {/* HEVC for Safari (must be first) */}
  <source 
    src="/videos/hevc/jalen-edusei-black.mov" 
    type="video/quicktime; codecs=hvc1.1.6.H120.b0" 
  />
  {/* WebM for Chrome/Firefox */}
  <source 
    src="/videos/jalen-edusei-black.webm" 
    type="video/webm; codecs=vp09.00.41.08" 
  />
</video>
```

## Quality Settings

Adjust `-q:v` for quality vs file size:
- `-q:v 30`: Higher quality, larger file
- `-q:v 35`: Balanced (default)
- `-q:v 40`: Lower quality, smaller file

Adjust `-alpha_quality` for alpha channel:
- `-alpha_quality 1.0`: Best alpha quality
- `-alpha_quality 0.75`: Balanced (default)
- `-alpha_quality 0.5`: Lower alpha quality, smaller file

## Output Files

Converted videos will be saved to:
```
public/videos/hevc/
├── jalen-edusei-black.mov
├── jalen-edusei-white.mov
├── jalen-edusei-transition-1.mov
└── jalen-edusei-transition-2.mov
```

## References

- [Jake Archibald's Video Transparency Guide](https://jakearchibald.com/2024/video-with-transparency/)
- [Stacked Alpha Video Package](https://www.npmjs.com/package/stacked-alpha-video)
- [Apple HEVC with Alpha Documentation](https://developer.apple.com/av-foundation/HEVC-Video-with-Alpha-Interoperability-Profile.pdf)
