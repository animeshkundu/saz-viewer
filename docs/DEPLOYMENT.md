# GitHub Pages Deployment Guide

SAZ Viewer uses one deployment workflow for both the primary site and branch
previews. Deployment starts only after the CI workflow succeeds for a push.

## Deployment Targets

| Source branch | Published path |
|---|---|
| `main` | `https://<owner>.github.io/<repository>/` |
| Any non-main source branch | `https://<owner>.github.io/<repository>/test-{branch-name}-{hash}/` |

Preview names are lowercase and characters outside `a-z`, `0-9`, `.`, `_`,
and `-` become `-`. An eight-character hash of the original branch name keeps
otherwise-colliding names distinct. For example, `feature/import-ui` is
published at `test-feature-import-ui-7babe353/`.

## One-Time Repository Setup

1. Open **Settings → Pages**.
2. Under **Build and deployment**, select **Deploy from a branch**.
3. Select the `gh-pages` branch and `/(root)` folder.
4. Open **Settings → Actions → General** and grant workflows read and write
   repository permissions.

The `gh-pages` branch is created by the first successful deployment. If it is
not available when configuring Pages, run the workflow once and then select
it.

## Deployment Flow

1. A push to any source branch starts `.github/workflows/ci.yml`. The generated
   `gh-pages` publishing branch is excluded.
2. CI runs lint, type checking, build, unit coverage, and E2E tests.
3. CI packages the build with its final Pages base path.
4. `.github/workflows/deploy.yml` runs only when push CI succeeds and publishes
   the validated artifact without checking out or executing branch code. It
   rejects stale commits and independently enforces the publish destination.
5. A `main` push updates the primary site. A non-main push updates that
   branch's preview directory without changing the primary site or other
   previews.

Pages updates share a serialized deployment queue so concurrent successful CI
runs are preserved rather than racing or replacing one another.

Pull-request CI does not deploy. The push event for the pull request's source
branch creates or updates its preview.

## Local Verification

```bash
npm ci
npm run lint
npm run typecheck
npm run test:coverage
npm run e2e
VITE_BASE_PATH=/saz-viewer/ npm run build
```

To verify a branch preview build, include its target directory:

```bash
VITE_BASE_PATH=/saz-viewer/test-feature-import-ui-7babe353/ npm run build
```

## Troubleshooting

### Deployment workflow is skipped

Confirm that the corresponding CI run was caused by a push and completed
successfully. Pull-request workflow runs are intentionally ignored.

### Permission denied while publishing

Confirm that workflow permissions are set to read and write under
**Settings → Actions → General**.

### Site returns 404

Confirm that Pages is configured to deploy from `gh-pages` and `/(root)`.
Allow a few minutes for the first Pages build to finish.

### Assets return 404

Confirm that the generated asset URLs include the repository and deployment
path. The workflow sets `VITE_BASE_PATH` separately for primary and preview
builds.
