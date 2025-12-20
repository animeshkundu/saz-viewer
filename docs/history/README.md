# Feature History

This directory contains records of features, approaches, or technologies that have been deprecated, removed, or replaced in the SAZ Viewer project.

## Purpose

The history folder serves several important purposes:

1. **Institutional Memory**: Preserve knowledge about why certain approaches were tried and abandoned
2. **Avoid Repetition**: Prevent revisiting failed experiments or deprecated solutions
3. **Learning Resource**: Help new team members understand the evolution of the project
4. **Decision Context**: Provide historical context for current architectural decisions

## When to Create a History Entry

Create a history entry when:

- Removing a feature that was previously available to users
- Deprecating an API or integration
- Replacing a major library or dependency
- Abandoning an architectural approach or pattern
- Reverting a significant refactoring
- Documenting a failed experiment or proof-of-concept

## History Entry Format

Each entry should follow this structure:

```markdown
# [Feature/Approach Name]

## Status
[Removed | Deprecated | Replaced]

## Date Removed/Deprecated
YYYY-MM-DD

## Original Purpose
[Why was this feature/approach implemented?]

## Implementation Details
[Brief technical description]

## Reason for Removal/Deprecation
[Why was this removed?]

## Replacement (if applicable)
[What replaced it? Link to relevant ADR]

## Migration Notes
[How users/developers should migrate]

## References
[Links to related PRs, issues, discussions]
```

## Naming Convention

Use descriptive names with dates:

```
YYYY-MM-DD-feature-name.md
```

Examples:
- `2024-12-20-server-side-rendering.md`
- `2024-12-20-mongodb-integration.md`
- `2024-12-20-jquery-dependency.md`

## Current Entries

Currently, this directory is empty as the project is in its initial release. As features are deprecated or removed, they will be documented here.

## Contributing

When documenting deprecated/removed features:

1. Be factual and objective - avoid blame
2. Explain the reasoning clearly
3. Provide migration guidance if applicable
4. Link to related ADRs or documentation
5. Include dates and version information
