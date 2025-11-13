# Quick Start Guide for Anmore

## Local Development

1. **Clone and Install**:
   ```bash
   git clone https://github.com/anmore/anmore.git
   cd anmore
   pnpm i
   pnpm i sharp --include=optional
   ```

2. **Configure Environment**:
   ```bash
   # Copy example env file (if it exists)
   cp .env.example .env.local
   
   # Edit .env.local with your settings
   # Minimum required:
   # VITE_APP_NAME=Anmore
   # VITE_APP_URL=http://localhost:5173
   # VITE_NIP05_DOMAIN=anmore.me
   # VITE_DEFAULT_HASHTAG=anmore
   # VITE_ADMIN_PUBKEYS=your_admin_pubkey_here
   ```

3. **Start Development Server**:
   ```bash
   pnpm run dev
   ```

4. **Build for Production**:
   ```bash
   pnpm run build
   # Output will be in dist/ folder
   ```

## GitHub Pages Setup

1. **Enable GitHub Pages**:
   - Repository Settings → Pages
   - Source: GitHub Actions

2. **Push to Main Branch**:
   ```bash
   git push origin main
   ```
   - The workflow will automatically build and deploy

3. **Configure Custom Domain** (Optional):
   - Update `CNAME` file with your domain
   - Configure DNS records

## First-Time Admin Setup

1. **Get Your Pubkey**:
   - Log in to Anmore using any method
   - Go to Settings → Keys
   - Copy your hex pubkey

2. **Set Admin Pubkeys**:
   - Add your pubkey to `VITE_ADMIN_PUBKEYS` in `.env.local` (local) or GitHub Secrets (production)
   - Format: `pubkey1,pubkey2,pubkey3`

3. **Access Admin Dashboard**:
   - After setting admin pubkeys, refresh the app
   - You'll see an "Admin" menu item
   - Go to Admin → Hashtag Management to set up whitelist

## Testing the Build

Before deploying, test the build locally:

```bash
# Build
pnpm run build

# Test the build (requires a simple HTTP server)
cd dist
python -m http.server 8000
# Or use any static file server
```

Visit `http://localhost:8000` to verify everything works.

## Common Issues

**Build fails**: 
- Ensure `sharp` is installed: `pnpm i sharp --include=optional`
- Check Node.js version (20.x recommended)

**Admin menu not showing**:
- Verify `VITE_ADMIN_PUBKEYS` includes your pubkey
- Check pubkey format (64 hex characters, no spaces)
- Refresh the page after changing env vars

**Hashtags not filtering**:
- Admin must publish hashtag whitelist first
- Go to Admin → Hashtag Management
- Add hashtags to whitelist
- Empty whitelist = show all hashtags

**NIP-05 login not working**:
- Verify `VITE_NIP05_DOMAIN` is set correctly
- Ensure NIP-05 verification is set up on your domain
- Check browser console for errors

