# Deployment Guide for Anmore

## GitHub Pages Deployment

Anmore is configured for automatic deployment to GitHub Pages using GitHub Actions.

### Setup Instructions

1. **Enable GitHub Pages**:
   - Go to your repository Settings → Pages
   - Under "Source", select "GitHub Actions"
   - Save the settings

2. **Configure Domain (Optional)**:
   - The `CNAME` file is set to `anmore.me`
   - If using a custom domain, update the `CNAME` file
   - Configure DNS to point to GitHub Pages:
     - Add a CNAME record: `anmore.me` → `yourusername.github.io`
     - Or add A records pointing to GitHub Pages IPs

3. **Environment Variables**:
   - For GitHub Pages, set environment variables in the repository Settings → Secrets and variables → Actions
   - Or create a `.env.local` file (not committed to git) for local development
   - See `.env.example` for available variables

### Deployment Process

The workflow (`.github/workflows/deploy.yml`) automatically:
- Builds the application on push to `main` or `master` branch
- Deploys to GitHub Pages
- Uses Node.js 20.x and pnpm 8
- Includes all necessary build steps (sharp installation, etc.)

### Manual Deployment

To deploy manually:
```bash
# Install dependencies
pnpm i

# Install sharp (required)
pnpm i sharp --include=optional

# Build
NODE_OPTIONS=--max_old_space_size=16384 pnpm run build

# The dist/ folder contains the built files
# Upload to your hosting provider
```

### Required Environment Variables

Minimum required variables for Anmore:
- `VITE_APP_NAME` - Application name (default: "Anmore")
- `VITE_APP_URL` - Application URL (default: "https://anmore.me")
- `VITE_NIP05_DOMAIN` - NIP-05 domain (default: "anmore.me")
- `VITE_DEFAULT_HASHTAG` - Default hashtag (default: "anmore")
- `VITE_ADMIN_PUBKEYS` - Comma-separated admin pubkeys (optional)

### Troubleshooting

**Build fails with memory errors**:
- The workflow uses `NODE_OPTIONS=--max_old_space_size=16384`
- If issues persist, increase the memory limit

**Sharp installation fails**:
- Ensure `pnpm i sharp --include=optional` runs before build
- The workflow handles this automatically

**GitHub Pages shows 404**:
- Ensure GitHub Actions workflow completed successfully
- Check that Pages source is set to "GitHub Actions"
- Verify the `dist/` folder was created in the build

**Domain not working**:
- Verify DNS settings point to GitHub Pages
- Check that `CNAME` file exists and is correct
- Wait for DNS propagation (can take up to 48 hours)

