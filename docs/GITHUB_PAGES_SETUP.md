# GitHub Pages Deployment Setup

## Workflows

- `.github/workflows/ci.yml` validates every source-branch push and pull requests
  targeting `main`.
- `.github/workflows/deploy.yml` is the only Pages publisher. It runs after a
  successful push CI run.

The primary site is built from `main`. Non-main branches are built under a
sanitized `test-{branch-name}` directory so previews coexist with production.

## Required Repository Settings

1. In **Settings → Actions → General**, grant workflows read and write
   repository permissions.
2. Trigger one successful deployment to create `gh-pages`.
3. In **Settings → Pages**, choose **Deploy from a branch**.
4. Select `gh-pages` and `/(root)`.

## URLs

- Primary: `https://animeshkundu.github.io/saz-viewer/`
- Branch example: `feature/import-ui` becomes
  `https://animeshkundu.github.io/saz-viewer/test-feature-import-ui/`

Branch names are lowercased. Runs of unsupported URL characters are replaced
with `-`.

## Verification

1. Push a branch and confirm that `CI/CD Pipeline` succeeds.
2. Confirm that `Deploy GitHub Pages` runs for the same commit.
3. Visit the branch preview URL.
4. Merge to `main`, wait for both workflows, and verify the primary URL.

See [DEPLOYMENT.md](./DEPLOYMENT.md) for the complete flow and troubleshooting.
