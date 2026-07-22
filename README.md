# SAZ Viewer

A 100% client-side, serverless web application for inspecting Telerik Fiddler .saz files in-browser without uploading data or installing desktop software.

## Features

- 🔒 **100% Client-Side** - All parsing happens locally in your browser; no data leaves your machine
- 📁 **Drag & Drop** - Simple file loading with instant validation
- 🔍 **Session Inspector** - Multi-tab interface with auto-detection (Headers/Raw/JSON/XML/Hex)
- 📊 **Professional Grid** - Sortable columns, search filtering, and method filtering
- 🎨 **Syntax Highlighting** - Beautiful code rendering for JSON, XML, and HTTP content
- ⚡ **Fast & Responsive** - Handles large files with async parsing

## Documentation

Detailed documentation is available in the [`/docs`](./docs) folder:

- [**PRD.md**](./docs/PRD.md) - Product Requirements Document
- [**TESTING.md**](./docs/TESTING.md) - Testing strategy and guidelines
- [**DEPLOYMENT.md**](./docs/DEPLOYMENT.md) - Deployment instructions
- [**GITHUB_PAGES_SETUP.md**](./docs/GITHUB_PAGES_SETUP.md) - GitHub Pages deployment setup
- [**SECURITY.md**](./docs/SECURITY.md) - Security considerations
- [**APP_README.md**](./docs/APP_README.md) - Application architecture details

## GitHub Pages Deployment

This project is configured to automatically deploy to GitHub Pages on every push to the `main` branch.

### Setup Instructions

1. **Enable GitHub Pages** in your repository:
   - Go to your repository **Settings** → **Pages**
   - Under **Source**, select **Deploy from a branch**
   - Select `gh-pages` and `/(root)`
   - Save the settings

2. **Push a branch**:
   ```bash
   git add .
   git commit -m "Deploy to GitHub Pages"
   git push origin main
   ```

3. **Monitor the deployment**:
   - Go to the **Actions** tab in your repository
   - Watch the "CI/CD Pipeline" and "Deploy GitHub Pages" workflow runs
   - Once complete, your site will be available at: `https://<username>.github.io/<repository-name>/`

### How It Works

- `.github/workflows/ci.yml` validates every source-branch push.
- CI builds a deployment artifact with the correct base path. After all checks
  succeed, `.github/workflows/deploy.yml` publishes that artifact.
- `main` updates the primary site. Other branches publish to a lowercase,
  sanitized `test-{branch-name}/` path.

### Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Testing

This project includes comprehensive test coverage with both unit and E2E tests.

### Unit Tests

Unit tests are written using [Vitest](https://vitest.dev/) and [React Testing Library](https://testing-library.com/react).

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui
```

**Current Coverage:** 92% overall (80% lines, 75% branches, 70% functions required)

### E2E Tests

End-to-end tests are written using [Playwright](https://playwright.dev/).

```bash
# Run E2E tests
npm run e2e

# Run E2E tests in UI mode (interactive)
npm run e2e:ui

# Run E2E tests in headed mode (visible browser)
npm run e2e:headed

# Run E2E tests in debug mode
npm run e2e:debug

# Show test report
npm run e2e:report
```

**E2E Test Suites:**
- **File Upload** - File handling, validation, and error scenarios
- **Session Navigation** - Session selection, keyboard navigation, filtering
- **Inspector Panel** - Request/response display, headers, body content
- **UI Interactions** - Layout, resizing, search, and general UI functionality

### Type Checking

```bash
# Run TypeScript type checking
npm run typecheck
```

### Linting

```bash
# Run ESLint
npm run lint
```

## CI/CD Pipeline

The project uses GitHub Actions for continuous integration and deployment:

1. **Lint** - Code quality checks
2. **Typecheck** - TypeScript validation
3. **Build** - Application build
4. **Unit Tests** - Run with coverage requirements
5. **E2E Tests** - Playwright browser tests
6. **Deploy** - Publish `main` at the primary GitHub Pages URL and each
   non-main branch at `test-{branch-name}/`

Deployments run only after all CI checks pass. See `.github/workflows/ci.yml`
and `.github/workflows/deploy.yml` for details.

## License

The Spark Template files and resources from GitHub are licensed under the terms of the MIT license, Copyright GitHub, Inc.
