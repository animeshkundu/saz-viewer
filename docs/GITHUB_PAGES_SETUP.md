# GitHub Pages Deployment Setup

## Workflows

- `.github/workflows/ci.yml` validates every source-branch push and pull requests
  targeting `main`.
- `.github/workflows/deploy.yml` is the only Pages publisher. It runs after a
  successful push CI run.

The primary site is built from `main`. Non-main branches are built under a
collision-safe `test-{branch-name}-{hash}` directory so previews coexist with
production.

## Required Repository Settings

1. In **Settings → Actions → General**, grant workflows read and write
   repository permissions.
2. In **Settings → Pages**, choose **GitHub Actions** as the source.

The workflow uses `gh-pages` only as a staging tree so the primary site and
branch previews can be packaged together. Selecting a branch source would
create a competing automatic deployment.

## URLs

- Primary: `https://animeshkundu.github.io/saz-viewer/`
- Branch example: `feature/import-ui` becomes
  `https://animeshkundu.github.io/saz-viewer/test-feature-import-ui-7babe353/`

Branch names are lowercased. Runs of unsupported URL characters are replaced
with `-`, names with no supported characters fall back to `branch`, and an
eight-character hash preserves uniqueness.

## Verification

1. Push a branch and confirm that `CI/CD Pipeline` succeeds.
2. Confirm that `Deploy GitHub Pages` runs for the same commit.
3. Visit the branch preview URL.
4. Merge to `main`, wait for both workflows, and verify the primary URL.

See [DEPLOYMENT.md](./DEPLOYMENT.md) for the complete flow and troubleshooting.
