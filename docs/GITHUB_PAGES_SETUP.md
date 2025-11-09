# GitHub Pages Deployment Setup

## Current Status ✅

The repository is configured with GitHub Actions workflows for:
1. **CI Pipeline** (`.github/workflows/ci.yml`) - Runs on PRs and main branch
2. **Deploy Pipeline** (`.github/workflows/deploy.yml`) - Deploys to GitHub Pages on main branch push

## Configuration Files

### 1. GitHub Actions Workflows

#### CI Workflow (`.github/workflows/ci.yml`)
- Runs linter (`npm run lint`)
- Runs tests with coverage (`npm run test:coverage`)
- Builds the application
- Comments coverage report on PRs

#### Deploy Workflow (`.github/workflows/deploy.yml`)
- Runs tests with coverage
- Builds with correct base path: `VITE_BASE_PATH=/<repo-name>/`
- Uploads build artifacts to GitHub Pages
- Deploys to GitHub Pages

### 2. Build Configuration

#### `vite.config.ts`
```typescript
base: process.env.VITE_BASE_PATH || './',
```
This ensures the app works both locally (with `./`) and on GitHub Pages (with `/saz-viewer/`).

#### `vitest.config.ts`
- Configured with `@` alias for `./src`
- Uses jsdom environment
- Generates v8 coverage reports

#### `tsconfig.json`
- Configured with path aliases matching Vite config

## GitHub Repository Settings Required

To enable GitHub Pages deployment, configure these settings in your GitHub repository:

### Steps:

1. **Go to Repository Settings**
   - Navigate to: `https://github.com/animeshkundu/saz-viewer/settings`

2. **Enable GitHub Pages**
   - Go to: **Settings** → **Pages**
   - Under "Build and deployment":
     - **Source**: Select "GitHub Actions"
     - This allows the workflow to deploy directly

3. **Set Permissions for GitHub Actions**
   - Go to: **Settings** → **Actions** → **General**
   - Under "Workflow permissions":
     - Select "Read and write permissions"
     - Check "Allow GitHub Actions to create and approve pull requests"
   - Click "Save"

## Testing Locally

### Before Pushing to GitHub:

```bash
# 1. Install dependencies
npm install

# 2. Run linter (must pass with 0 errors)
npm run lint

# 3. Run tests
npm test

# 4. Run tests with coverage
npm run test:coverage

# 5. Build with GitHub Pages base path
VITE_BASE_PATH=/saz-viewer/ npm run build

# 6. Preview the build
npm run preview
```

### Expected Build Output:
```
dist/
├── index.html
├── assets/
│   ├── index-[hash].css
│   └── index-[hash].js
└── (other static files)
```

## Known Issues & Fixes

### Issue 1: Test Failures
**Current State**: Some tests are failing due to:
- Missing `scrollIntoView` mock in test environment
- Some assertion mismatches in parser tests

**Impact on Deployment**: 
- The CI workflow will fail if tests don't pass
- The deploy workflow runs tests and will fail too

**Fix Options**:
1. **Option A**: Fix all failing tests (recommended)
2. **Option B**: Temporarily allow deployment despite test failures by removing `npm run test:coverage` from deploy.yml (NOT recommended for production)

### Issue 2: Coverage Reports
**Current State**: Coverage reports are not generated when tests fail

**Fix**: Tests must pass for coverage to be generated

## Deployment Process

Once configured, the deployment process is automatic:

1. **Push to main branch**
   ```bash
   git add .
   git commit -m "Your commit message"
   git push origin main
   ```

2. **GitHub Actions runs**
   - CI workflow runs tests and builds
   - Deploy workflow builds and deploys to Pages

3. **Access your site**
   - URL: `https://animeshkundu.github.io/saz-viewer/`
   - May take 1-2 minutes after deployment completes

## Verifying Deployment

After pushing to main:

1. Check workflow status:
   - Go to: `https://github.com/animeshkundu/saz-viewer/actions`
   - Both CI and Deploy workflows should show green checkmarks

2. Visit the deployed site:
   - URL: `https://animeshkundu.github.io/saz-viewer/`

## Troubleshooting

### Workflow Fails with "Permission denied"
- Check that GitHub Actions has write permissions (see repository settings above)

### Site shows 404
- Verify GitHub Pages is enabled and source is set to "GitHub Actions"
- Check that `VITE_BASE_PATH` matches your repository name

### Assets not loading (404 on JS/CSS files)
- Verify `base` path in vite.config.ts is correctly set
- Check deploy.yml uses: `VITE_BASE_PATH: /${{ github.event.repository.name }}/`

### Tests fail in CI but pass locally
- Ensure `vitest.config.ts` has the `@` alias configured
- Check that all dependencies are in package.json (not just locally installed)

## Next Steps

1. ✅ Fix failing tests (primarily the scrollIntoView mock issue)
2. ✅ Configure GitHub repository settings for Pages
3. ✅ Push to main and verify deployment
4. ✅ Test the deployed application

## Files Checklist

- [x] `.github/workflows/ci.yml` - CI workflow configured
- [x] `.github/workflows/deploy.yml` - Deploy workflow configured
- [x] `vite.config.ts` - Base path configured with env variable
- [x] `vitest.config.ts` - Alias and coverage configured
- [x] `tsconfig.json` - Path aliases configured
- [x] `package.json` - All scripts defined
- [ ] All tests passing
- [ ] GitHub Pages enabled in repository settings
- [ ] GitHub Actions permissions configured
