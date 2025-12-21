# SAZ Viewer Documentation

This directory contains all documentation for the SAZ Viewer project.

## 📋 Table of Contents

### 🎯 Product & Planning
- [**PRD.md**](./PRD.md) - Product Requirements Document with features, user stories, and technical specifications

### 🏗️ Architecture & Design
- [**ARCHITECTURE.md**](./ARCHITECTURE.md) - System architecture, container structure, and technical design
- [**DESIGN.md**](./DESIGN.md) - UI/UX design specifications, component design, and styling guidelines
- [**ADR/**](./ADR/) - Architectural Decision Records documenting key technical decisions
  - [ADR README](./ADR/README.md) - Index and guide to ADRs
  - [ADR Template](./ADR/ADR-TEMPLATE.md) - Template for new ADRs
  - [ADR-0001](./ADR/ADR-0001-client-side-architecture.md) - Client-Side Only Architecture
  - [ADR-0002](./ADR/ADR-0002-react-typescript-stack.md) - React + TypeScript Tech Stack
  - [ADR-0003](./ADR/ADR-0003-jszip-for-parsing.md) - JSZip for SAZ File Parsing

### 💻 Development
- [**AGENT.md**](./AGENT.md) - **Comprehensive AI agent instructions** - Start here for AI-assisted development
- [**APP_README.md**](./APP_README.md) - Application implementation details and component structure
- [**TESTING.md**](./TESTING.md) - Testing strategy, coverage requirements (90%+), and test guidelines

### 📦 Deployment
- [**DEPLOYMENT.md**](./DEPLOYMENT.md) - General deployment instructions and configuration
- [**GITHUB_PAGES_SETUP.md**](./GITHUB_PAGES_SETUP.md) - Complete guide for GitHub Pages deployment setup
- [**DEPLOYMENT_SUMMARY.md**](./DEPLOYMENT_SUMMARY.md) - Summary of deployment status and configuration

### 🔒 Quality & Security
- [**SECURITY.md**](./SECURITY.md) - Security considerations, privacy guarantees, and best practices
- [**TEST_SUMMARY.md**](./TEST_SUMMARY.md) - Testing results and coverage summary
- [**CHECKLIST.md**](./CHECKLIST.md) - Project completion checklist

### 📚 Historical Records
- [**history/**](./history/) - Deprecated features and removed functionality
  - [History README](./history/README.md) - Guide to historical records

## 🤖 AI Agent Documentation

### For AI/LLM Development Assistance

If you are an AI agent or LLM assisting with development:

1. **Start Here**: [AGENT.md](./AGENT.md) - Comprehensive instructions for AI agents
2. **Architecture**: [ARCHITECTURE.md](./ARCHITECTURE.md) - Understand the system
3. **Design**: [DESIGN.md](./DESIGN.md) - Follow design specifications
4. **Testing**: [TESTING.md](./TESTING.md) - Maintain 90%+ coverage

### GitHub Copilot Integration

See [`.github/copilot-instructions.md`](../.github/copilot-instructions.md) for Copilot-specific guidance.

### Specialized Agents

Located in `.github/`:
- [**planning.md**](../.github/agents/planning.md) - Planning and analysis agent
- [**coding.md**](../.github/agents/coding.md) - Implementation and coding agent
- [**testing.md**](../.github/agents/testing.md) - Testing and review agent
- [**orchestrator.md**](../.github/agents/orchestrator.md) - Orchestrator/CEO agent

## 📖 Reading Paths

### For New Developers

1. [README](../README.md) - Project overview
2. [PRD.md](./PRD.md) - What we're building and why
3. [ARCHITECTURE.md](./ARCHITECTURE.md) - How it's structured
4. [APP_README.md](./APP_README.md) - Implementation details
5. [TESTING.md](./TESTING.md) - How to test

### For AI Agents

1. [AGENT.md](./AGENT.md) - Start here (required reading)
2. [ARCHITECTURE.md](./ARCHITECTURE.md) - System structure
3. [DESIGN.md](./DESIGN.md) - UI/UX specifications
4. [ADR/](./ADR/) - Architectural decisions
5. [TESTING.md](./TESTING.md) - Testing requirements

### For Contributors

1. [README](../README.md) - Project overview
2. [AGENT.md](./AGENT.md) - Development standards and workflow
3. [ADR/](./ADR/) - Understand past decisions
4. [TESTING.md](./TESTING.md) - Test requirements

## 🔗 Quick Links

- [Main README](../README.md)
- [GitHub Repository](https://github.com/animeshkundu/saz-viewer)
- [Live Demo](https://animeshkundu.github.io/saz-viewer/)

## ✅ Core Principles

1. **Privacy First**: 100% client-side processing - no data transmission
2. **Quality Standards**: 90%+ test coverage required
3. **Type Safety**: Strict TypeScript throughout
4. **Documentation**: Decisions recorded in ADRs

## 📝 Contributing

When adding new documentation:

1. Place files in appropriate subdirectory:
   - Architecture decisions → `ADR/`
   - Deprecated features → `history/`
   - General docs → `docs/`

2. Update this README.md with links to new documents

3. Use appropriate naming:
   - ADRs: `ADR-XXXX-short-title.md`
   - History: `YYYY-MM-DD-feature-name.md`
   - General: `DESCRIPTIVE_NAME.md`

4. Follow markdown formatting standards

5. Cross-reference related documents

## 🗂️ Document Types

### ADRs (Architectural Decision Records)
Document significant architectural decisions. Use the [ADR template](./ADR/ADR-TEMPLATE.md).

**When to create:**
- Technology choices (dependencies, frameworks)
- Architectural patterns
- Breaking changes
- Security decisions

### History Records
Document deprecated or removed features. See [history README](./history/README.md).

**When to create:**
- Removing features
- Deprecating APIs
- Failed experiments
- Major refactorings reverted

### General Documentation
Product, implementation, testing, deployment docs.

**When to update:**
- Feature changes
- Process changes
- Architecture evolution
- New patterns established
