# GitHub Pages Deployment Guide

## Quick Start

Your SAZ Viewer is ready to deploy to GitHub Pages! Follow these steps:

### 1. Enable GitHub Pages

1. Go to your GitHub repository
2. Click **Settings** (top menu)
3. Click **Pages** (left sidebar)
4. Under **Source**, select **GitHub Actions**
5. Click **Save**

### 2. Push to Deploy

Every push to the `main` branch automatically triggers deployment:

```bash
git add .
git commit -m "Your commit message"
git push origin main
```

### 3. Access Your Site

After the GitHub Action completes (2-3 minutes), your site will be live at:

```
https://<your-username>.github.io/<repository-name>/
```

For example:
- Repository: `octocat/saz-viewer`
- Live URL: `https://octocat.github.io/saz-viewer/`

## Monitoring Deployment

1. Go to the **Actions** tab in your repository
2. Click on the latest "Deploy to GitHub Pages" workflow run
3. Watch the build and deploy steps
4. Once complete (green checkmark ✅), your site is live!

## Troubleshooting

### Build Fails

- Check the Actions tab for error messages
- Ensure all dependencies are in `package.json`
- Verify `npm run build` works locally

### 404 on Deployed Site

- Ensure GitHub Pages is set to **GitHub Actions** (not a branch)
- Wait 2-3 minutes after first deployment
- Check the Actions tab to confirm deployment succeeded

### Assets Not Loading

- The workflow automatically sets the correct base path
- If you see 404s for CSS/JS, check the build output in Actions logs

## Technical Details

### What Happens on Push

1. **Build Job**:
   - Checks out your code
   - Sets up Node.js 20
   - Installs dependencies (`npm ci`)
   - Builds the app with correct base path
   - Uploads the `dist` folder as an artifact

2. **Deploy Job**:
   - Downloads the build artifact
   - Deploys to GitHub Pages
   - Makes the site live

### Configuration Files

- **`.github/workflows/deploy.yml`** - The GitHub Actions workflow
- **`vite.config.ts`** - Vite configuration with dynamic base path
- Both files are already configured; no changes needed!

## Need Help?

- View workflow runs: **Actions** tab
- Check build logs: Click on a workflow run → **build** job
- GitHub Pages docs: https://docs.github.com/pages
