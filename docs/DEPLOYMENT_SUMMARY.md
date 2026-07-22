# GitHub Pages Deployment Summary

- CI runs on every source-branch push and on pull requests targeting `main`.
- `.github/workflows/deploy.yml` is the sole deployment workflow.
- Deployment occurs only after successful push CI.
- `main` publishes to `https://<owner>.github.io/<repository>/`.
- Non-main branches publish to `test-{sanitized-branch-name}/`.
- All sites coexist on the `gh-pages` branch.
- GitHub Pages must use `gh-pages` and `/(root)` as its branch source.

See [DEPLOYMENT.md](./DEPLOYMENT.md) for setup, URL rules, local verification,
and troubleshooting.
