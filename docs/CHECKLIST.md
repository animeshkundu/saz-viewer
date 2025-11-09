# GitHub Pages Setup Checklist

Use this checklist to ensure your SAZ Viewer is ready for GitHub Pages deployment.

## ✅ Pre-Deployment Checklist

### 1. Repository Settings

- [ ] Repository is public (or you have GitHub Pro/Team for private repos)
- [ ] Go to **Settings** → **Pages**
- [ ] Under **Source**, select **GitHub Actions**
- [ ] Click **Save**

### 2. Verify Configuration Files

- [x] `.github/workflows/deploy.yml` exists and is configured
- [x] `vite.config.ts` has dynamic base path support
- [x] `package.json` has build script: `"build": "tsc -b --noCheck && vite build"`

### 3. Test Locally

- [ ] Run `npm install` successfully
- [ ] Run `npm run build` without errors
- [ ] Check that `dist` folder is created with `index.html` and assets

### 4. Push and Deploy

- [ ] Commit all changes: `git add . && git commit -m "Setup GitHub Pages"`
- [ ] Push to main: `git push origin main`
- [ ] Go to **Actions** tab and watch the workflow run
- [ ] Wait for deployment to complete (green checkmark)

### 5. Verify Deployment

- [ ] Visit `https://<username>.github.io/<repository-name>/`
- [ ] Test drag-and-drop functionality
- [ ] Load a sample .saz file and verify it works
- [ ] Check browser console for any errors

## 🎉 Success!

If all items are checked, your SAZ Viewer is live on GitHub Pages!

## 📝 Notes

- **Deployment Time**: First deployment takes 2-3 minutes
- **Subsequent Deploys**: Every push to `main` triggers automatic deployment
- **Cache**: If you don't see changes, try hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

## 🔧 Common Issues

### GitHub Pages Not Enabled

**Symptom**: Workflow fails with "pages build" error

**Solution**: 
1. Go to Settings → Pages
2. Select "GitHub Actions" under Source
3. Re-run the failed workflow

### 404 After Deployment

**Symptom**: Site shows 404 after successful deployment

**Solution**:
1. Wait 2-3 minutes for DNS propagation
2. Clear browser cache
3. Check Actions tab to confirm deployment succeeded
4. Verify the URL format: `https://<username>.github.io/<repo-name>/`

### Assets Not Loading

**Symptom**: HTML loads but CSS/JS returns 404

**Solution**:
1. Check that `VITE_BASE_PATH` is set in workflow
2. Verify `vite.config.ts` uses `process.env.VITE_BASE_PATH`
3. Re-run the build workflow

## 📚 Documentation

- [README.md](./README.md) - General project information
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Detailed deployment guide
- [GitHub Pages Docs](https://docs.github.com/pages)
