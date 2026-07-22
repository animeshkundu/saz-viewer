# GitHub Pages Setup Checklist

## Repository Settings

- [ ] **Settings → Actions → General** grants workflows read and write
  permissions
- [ ] A successful deployment has created the `gh-pages` branch
- [ ] **Settings → Pages** uses **Deploy from a branch**
- [ ] Pages publishes `gh-pages` from `/(root)`

## Local Quality Gates

- [ ] `npm ci`
- [ ] `npm run lint`
- [ ] `npm run typecheck`
- [ ] `npm run test:coverage`
- [ ] `npm run e2e`
- [ ] `VITE_BASE_PATH=/saz-viewer/ npm run build`

## Deployment Verification

- [ ] A non-main branch push passes `CI/CD Pipeline`
- [ ] `Deploy GitHub Pages` publishes its `test-{branch-name}` preview
- [ ] Preview assets load without 404 responses
- [ ] A merge to `main` passes CI and updates the primary site
- [ ] The primary site and existing branch previews remain available

See [DEPLOYMENT.md](./DEPLOYMENT.md) for details.
