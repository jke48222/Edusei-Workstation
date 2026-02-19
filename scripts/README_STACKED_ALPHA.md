# Stacked-Alpha Video Conversion

This approach converts videos to a stacked format where the color data is on top and alpha data is on the bottom. A WebGL shader then combines them to create transparency. **This works on all platforms including iOS Safari!**

## Advantages

- ✅ Works on Windows (no macOS needed)
- ✅ Works on all browsers including iOS Safari
- ✅ Smaller file sizes than native HEVC with alpha
- ✅ Better quality than native VP9/HEVC with alpha
- ✅ Uses modern AV1 codec (best compression)

## Quick Start

### 1. Convert Videos

```powershell
powershell -ExecutionPolicy Bypass -File scripts/convert_to_stacked_alpha.ps1
```

This creates:
- `public/videos/stacked-alpha/jalen-edusei-black_av1.mp4`
- `public/videos/stacked-alpha/jalen-edusei-black_hevc.mp4`
- (and same for white, transition-1, transition-2)

### 2. Install Package

```bash
npm install stacked-alpha-video
```

### 3. Update Component

Update `HeroVideoTitle.tsx` to use the stacked-alpha-video web component.

## How It Works

The video is encoded as double-height:
- **Top half**: Color data (RGB)
- **Bottom half**: Alpha data (as brightness)

A WebGL fragment shader reads both halves and combines them to create the final transparent video.

## File Sizes

Stacked-alpha videos are typically:
- **50-70% smaller** than native HEVC with alpha
- **30-50% smaller** than native VP9 with alpha
- Similar or smaller than animated AVIF (but with better performance)

## Browser Support

- ✅ Chrome/Edge (AV1)
- ✅ Firefox (AV1)
- ✅ Safari iOS/macOS (AV1 on iPhone 15 Pro+, M3 MacBook Pro+)
- ✅ Safari older devices (HEVC fallback)
- ✅ All mobile browsers

## References

- [Jake Archibald's Guide](https://jakearchibald.com/2024/video-with-transparency/)
- [NPM Package](https://www.npmjs.com/package/stacked-alpha-video)
