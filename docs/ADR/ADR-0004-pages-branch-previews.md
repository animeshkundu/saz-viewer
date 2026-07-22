# ADR-0004: GitHub Pages Branch Previews

## Status

**Accepted**

**Date**: 2026-07-22

**Author(s)**: SAZ Viewer Team

## Context

The repository had two workflows that could independently deploy the primary
GitHub Pages site. This duplicated builds and allowed deployments to race.
The project also needs each development branch to have a stable preview while
the primary URL continues to represent `main`.

GitHub's artifact-based Pages deployment replaces the entire site per
deployment. It therefore cannot preserve independent branch paths by itself.

## Decision Drivers

1. Deploy only commits that pass the complete CI pipeline.
2. Keep `main` at the primary repository Pages URL.
3. Keep multiple branch previews available at the same time.
4. Prevent concurrent publishers from overwriting each other.

## Considered Options

### Separate artifact-based Pages deployments

This retains the official Pages deployment action, but each branch deployment
replaces the primary site and other previews.

### Rebuild every branch into one artifact

This preserves all paths, but each deployment would need to fetch, install,
and build every active branch.

### Persistent `gh-pages` branch

This lets one serialized workflow update the primary files or one preview
directory while preserving the other deployments.

## Decision

Use `.github/workflows/deploy.yml` as the sole publisher. It runs after a
successful push execution of `CI/CD Pipeline` and publishes through a
persistent `gh-pages` branch. CI excludes that generated publishing branch.

- `main` is built with `/<repository>/` as its base path and published at the
  root.
- A non-main branch is built with
  `/<repository>/test-{sanitized-branch-name}/` as its base path and published
  to that directory.
- Deployment concurrency is serialized across branches.
- Pull-request workflow runs do not deploy; source-branch push runs do.

## Consequences

### Positive Consequences

- The primary site and branch previews coexist.
- Deployment cannot bypass CI.
- Deployment logic has one owner.
- Preview URLs are deterministic.

### Negative Consequences

- Pages must be configured to publish `gh-pages` from `/(root)`.
- Preview directories remain until replaced or manually removed.
- Sanitized branch names can theoretically collide.
- Publishing uses the pinned `peaceiris/actions-gh-pages` action.

### Risks and Mitigation

| Risk | Mitigation |
|---|---|
| Concurrent updates conflict | A shared Pages concurrency group serializes deployments. |
| Untrusted pull-request code gains write access | Only successful push runs trigger deployment. |
| Action supply-chain changes | The action is pinned to a reviewed commit SHA. |
| Incorrect asset paths | Each build receives its final deployment path through `VITE_BASE_PATH`. |

## References

- [GitHub Pages deployment guide](../DEPLOYMENT.md)
- [peaceiris/actions-gh-pages](https://github.com/peaceiris/actions-gh-pages)
