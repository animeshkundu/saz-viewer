# SAZ Viewer

A 100% client-side, serverless web application for inspecting Telerik Fiddler .saz files in-browser without uploading data or installing desktop software.

## Features

- 🔒 **100% Client-Side** - All parsing happens locally in your browser; no data leaves your machine
- 📁 **Drag & Drop** - Simple file loading with instant validation
- 🔍 **Session Inspector** - Multi-tab interface with auto-detection (Headers/Raw/JSON/XML/Hex)
- 📊 **Professional Grid** - Sortable columns, search filtering, and method filtering
- 🎨 **Syntax Highlighting** - Beautiful code rendering for JSON, XML, and HTTP content
- ⚡ **Fast & Responsive** - Handles large files with async parsing

## GitHub Pages Deployment

This project is configured to automatically deploy to GitHub Pages on every push to the `main` branch.

### Setup Instructions

1. **Enable GitHub Pages** in your repository:
   - Go to your repository **Settings** → **Pages**
   - Under **Source**, select **GitHub Actions**
   - Save the settings

2. **Push to main branch**:
   ```bash
   git add .
   git commit -m "Deploy to GitHub Pages"
   git push origin main
   ```

3. **Monitor the deployment**:
   - Go to the **Actions** tab in your repository
   - Watch the "Deploy to GitHub Pages" workflow run
   - Once complete, your site will be available at: `https://<username>.github.io/<repository-name>/`

### How It Works

- The `.github/workflows/deploy.yml` workflow automatically builds and deploys your app
- On push to `main`, it:
  1. Installs dependencies with `npm ci`
  2. Builds the production app with `npm run build`
  3. Configures the correct base path for GitHub Pages
  4. Deploys the `dist` folder to GitHub Pages

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

## License

The Spark Template files and resources from GitHub are licensed under the terms of the MIT license, Copyright GitHub, Inc.
