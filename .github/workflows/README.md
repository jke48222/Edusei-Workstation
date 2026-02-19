# GitHub Actions Workflows

## Convert WebM to HEVC with Alpha

This workflow converts WebM videos with alpha transparency to HEVC format for iOS Safari support.

### How to Use

1. **Push your code to GitHub** (public repo = free macOS runners)

2. **Trigger the workflow:**
   - Go to your repository on GitHub
   - Click the **Actions** tab
   - Select **"Convert WebM to HEVC with Alpha"** from the workflow list
   - Click **"Run workflow"** → **"Run workflow"** button
   - Or it will auto-run when you push changes to WebM files

3. **Wait for completion** (usually 2-5 minutes per video)

4. **Get your files:**
   - **Option A:** Download from artifacts
     - Go to the completed workflow run
     - Scroll down to "Artifacts"
     - Download "hevc-videos" zip file
     - Extract `.mov` files to `public/videos/hevc/`
   
   - **Option B:** Auto-committed (if on main/master branch)
     - The workflow will commit the files automatically
     - Just pull the changes: `git pull`

### Requirements

- Public GitHub repository (for free macOS runners)
- WebM video files in `public/videos/`:
  - `jalen-edusei-black.webm`
  - `jalen-edusei-white.webm`
  - `jalen-edusei-transition-1.webm`
  - `jalen-edusei-transition-2.webm`

### Free Tier Limits

- **Public repos:** 2000 minutes/month free
- **Private repos:** 2000 minutes/month free (GitHub Free)
- Each conversion takes ~2-5 minutes per video
- You can run this workflow ~400-1000 times per month for free!

### Troubleshooting

**Workflow fails:**
- Check the workflow logs in the Actions tab
- Ensure WebM files exist in `public/videos/`
- Verify files have alpha transparency

**Files not committed:**
- Check if you're on `main` or `master` branch
- Verify repository permissions allow workflow to write

**Artifacts not found:**
- Check workflow completed successfully
- Artifacts are retained for 30 days
