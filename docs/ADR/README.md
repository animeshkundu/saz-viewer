# Architectural Decision Records (ADR)

This directory contains Architectural Decision Records (ADRs) for the SAZ Viewer project. ADRs document significant architectural decisions made during the development lifecycle.

## What is an ADR?

An Architectural Decision Record (ADR) is a document that captures an important architectural decision made along with its context and consequences. ADRs help teams:

- Understand the reasoning behind past decisions
- Avoid revisiting settled discussions
- Onboard new team members faster
- Track the evolution of the architecture over time

## When to Create an ADR

Create an ADR when making decisions about:

- Technology selection (frameworks, libraries, databases)
- Architectural patterns and design principles
- Integration strategies and APIs
- Security and privacy approaches
- Performance optimization strategies
- Deployment and infrastructure choices
- Development practices and tooling

## ADR Naming Convention

ADRs are numbered sequentially and use the format:

```
ADR-XXXX-short-title.md
```

Examples:
- `ADR-0001-use-react-for-ui.md`
- `ADR-0002-client-side-only-architecture.md`
- `ADR-0003-jszip-for-saz-parsing.md`

## ADR Template

Use the [ADR-TEMPLATE.md](./ADR-TEMPLATE.md) as a starting point for new ADRs.

## ADR Lifecycle

ADRs go through the following statuses:

- **Proposed**: Decision is under consideration
- **Accepted**: Decision has been approved and is active
- **Deprecated**: Decision is no longer recommended but still in use
- **Superseded**: Decision has been replaced by a newer ADR (reference the new ADR)
- **Rejected**: Decision was considered but not adopted

## Index of ADRs

| ADR | Title | Status | Date |
|-----|-------|--------|------|
| [0001](./ADR-0001-client-side-architecture.md) | Client-Side Only Architecture | Accepted | 2024-12-20 |
| [0002](./ADR-0002-react-typescript-stack.md) | React + TypeScript Tech Stack | Accepted | 2024-12-20 |
| [0003](./ADR-0003-jszip-for-parsing.md) | JSZip for SAZ File Parsing | Accepted | 2024-12-20 |

## Contributing

When adding a new ADR:

1. Copy the [ADR-TEMPLATE.md](./ADR-TEMPLATE.md) file
2. Rename it following the naming convention
3. Fill in all sections thoroughly
4. Update this README with the new ADR entry
5. Submit for review before marking as "Accepted"
