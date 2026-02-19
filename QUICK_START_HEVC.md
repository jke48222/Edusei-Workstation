# Quick Start: Convert Videos Using GitHub Actions

## Step-by-Step Guide

### 1. Push Your Code to GitHub

```bash
git add .
git commit -m "Add GitHub Actions workflow for HEVC conversion"
git push origin main
```

### 2. Run the Workflow

1. Go to your repository on GitHub
2. Click the **Actions** tab (top navigation)
3. In the left sidebar, click **"Convert WebM to HEVC with Alpha"**
4. Click the **"Run workflow"** dropdown button (top right)
5. Select your branch (usually `main`)
6. Click the green **"Run workflow"** button

### 3. Wait for Completion

- The workflow will take about **5-10 minutes** total
- You can watch the progress in real-time
- Each video takes ~2-3 minutes to convert

### 4. Download the Converted Videos

**Option A: Download Artifacts**
1. Wait for the workflow to complete (green checkmark)
2. Click on the completed workflow run
3. Scroll down to the **"Artifacts"** section
4. Click **"hevc-videos"** to download the zip file
5. Extract the `.mov` files
6. Place them in `public/videos/hevc/` in your project

**Option B: Auto-Commit (if on main branch)**
- The workflow will automatically commit the files
- Just run: `git pull` to get them locally

### 5. Verify Files

After downloading/committing, you should have:
```
public/videos/hevc/
├── jalen-edusei-black.mov
├── jalen-edusei-white.mov
├── jalen-edusei-transition-1.mov
└── jalen-edusei-transition-2.mov
```

### 6. Test in Browser

The `HeroVideoTitle` component is already set up to use HEVC files when available. Safari (including iOS) will automatically use the `.mov` files, while Chrome/Firefox will use the `.webm` files.

## Troubleshooting

**"No workflow runs found"**
- Make sure you've pushed the `.github/workflows/convert-to-hevc.yml` file
- Check that you're looking at the correct repository

**Workflow fails**
- Check the workflow logs for error messages
- Ensure your WebM files are in `public/videos/`
- Verify the files have alpha transparency

**Can't download artifacts**
- Artifacts are available for 30 days
- Make sure the workflow completed successfully (green checkmark)

## Next Steps

Once you have the HEVC files:
1. The component will automatically use them on Safari/iOS
2. Test on an iPhone or iPad to verify transparency works
3. The videos should now display correctly on mobile Safari!

## Free Tier Info

- **Public repos:** 2000 minutes/month free ✅
- **Private repos:** 2000 minutes/month free ✅
- This workflow uses ~5-10 minutes per run
- You can run it **200-400 times per month** for free!
