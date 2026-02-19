# Free Ways to Convert WebM to HEVC with Alpha

## Option 1: GitHub Actions (Recommended - 100% Free)

GitHub provides **free macOS runners** for public repositories!

### Setup:

1. **Push your code to GitHub** (make repo public, or use free private repo)

2. **The workflow is already created** at `.github/workflows/convert-to-hevc.yml`

3. **Trigger the workflow:**
   - Go to your repo → Actions tab
   - Click "Convert WebM to HEVC with Alpha"
   - Click "Run workflow"
   - Or push changes to WebM files to auto-trigger

4. **Download the converted videos:**
   - After workflow completes, go to Actions → latest run
   - Download the "hevc-videos" artifact
   - Extract `.mov` files to `public/videos/hevc/`

### Benefits:
- ✅ 100% free
- ✅ No macOS needed
- ✅ Automated
- ✅ Can commit videos back to repo automatically

## Option 2: Use Stacked-Alpha (Already Works on Windows!)

The **stacked-alpha approach doesn't need macOS at all** - it works perfectly on Windows:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/convert_to_stacked_alpha.ps1
```

Then install and use:
```bash
npm install stacked-alpha-video
```

This is actually **better** than HEVC with alpha:
- Smaller file sizes
- Works everywhere
- Better performance
- No macOS needed

## Option 3: Free Online Services

Some free options (with limitations):

- **CloudConvert** - Free tier: 25 conversions/day
- **Zamzar** - Free tier: Limited conversions
- **Online-Convert** - Free but slower

Note: These may not preserve alpha perfectly.

## Option 4: Ask a Friend

If you know someone with a Mac, they can run:
```bash
chmod +x scripts/convert_webm_to_hevc_alpha.sh
./scripts/convert_webm_to_hevc_alpha.sh
```

Then transfer the `.mov` files back.

## Recommendation

**Use GitHub Actions** - it's free, automated, and you don't need macOS. Just push your code and run the workflow!
