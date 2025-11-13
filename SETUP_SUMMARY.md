# Anmore Setup Summary

## ✅ Completed Tasks

### 1. Code Implementation
- ✅ All branding updated from Coracle to Anmore
- ✅ Admin control system implemented
- ✅ Hashtag whitelist system with filtering
- ✅ Automatic default hashtag on all posts
- ✅ NIP-05 login with password-based nsec storage
- ✅ Services directory feature
- ✅ Navigation menus updated

### 2. GitHub Pages Deployment Setup
- ✅ Created `.github/workflows/deploy.yml` workflow
- ✅ Updated `CNAME` file for `anmore.me`
- ✅ Updated `index.html` (removed analytics, updated CSP)
- ✅ Updated `README.md` with Anmore branding
- ✅ Created `DEPLOYMENT.md` guide
- ✅ Created `QUICKSTART.md` guide

## 🚀 Next Steps for Deployment

### 1. Enable GitHub Pages
1. Go to repository Settings → Pages
2. Under "Source", select **"GitHub Actions"**
3. Save settings

### 2. Set Environment Variables (if needed)
If your build requires specific environment variables, add them as GitHub Secrets:
- Repository Settings → Secrets and variables → Actions
- Add secrets for any required variables (e.g., `VITE_ADMIN_PUBKEYS`)

### 3. Push to Main Branch
```bash
git add .
git commit -m "Initial Anmore setup with GitHub Pages deployment"
git push origin main
```

The workflow will automatically:
- Build the application
- Deploy to GitHub Pages
- Make it available at `https://yourusername.github.io/anmore` (or your custom domain)

### 4. Configure Custom Domain (Optional)
If using `anmore.me`:
1. The `CNAME` file is already set
2. Configure DNS:
   - Add CNAME record: `anmore.me` → `yourusername.github.io`
   - Or use A records pointing to GitHub Pages IPs
3. Wait for DNS propagation (up to 48 hours)

## 📝 Important Notes

### Environment Variables
The application uses environment variables with defaults, so it should work without configuration. However, for full functionality:

**Required for Admin Features**:
- `VITE_ADMIN_PUBKEYS` - Comma-separated list of admin pubkeys

**Recommended**:
- `VITE_APP_NAME` - "Anmore" (default)
- `VITE_APP_URL` - Your deployment URL
- `VITE_NIP05_DOMAIN` - "anmore.me" (default)
- `VITE_DEFAULT_HASHTAG` - "anmore" (default)

### Testing Locally
Before deploying, test locally:
```bash
pnpm i
pnpm i sharp --include=optional
pnpm run build
# Serve dist/ folder and test
```

### Build Requirements
- Node.js 20.x
- pnpm 8
- `sharp` package (installed automatically in workflow)
- 16GB+ memory recommended for build (workflow uses 16GB)

## 🔍 Verification Checklist

Before first deployment:
- [ ] GitHub Pages enabled with "GitHub Actions" source
- [ ] Environment variables set (if needed)
- [ ] `CNAME` file updated (if using custom domain)
- [ ] DNS configured (if using custom domain)
- [ ] Code pushed to `main` or `master` branch
- [ ] Workflow runs successfully (check Actions tab)

After deployment:
- [ ] Site loads at GitHub Pages URL
- [ ] Custom domain works (if configured)
- [ ] Admin can log in and access admin dashboard
- [ ] Hashtag filtering works
- [ ] NIP-05 login works
- [ ] Services directory accessible

## 📚 Documentation Files

- `README.md` - Main documentation
- `DEPLOYMENT.md` - Detailed deployment guide
- `QUICKSTART.md` - Quick start guide for developers
- `.env.example` - Environment variable template (if created)

## 🐛 Troubleshooting

**Workflow fails**:
- Check Actions tab for error details
- Verify Node.js version compatibility
- Ensure all dependencies install correctly

**Site shows 404**:
- Verify Pages source is set to "GitHub Actions"
- Check that workflow completed successfully
- Verify `dist/` folder was created

**Admin features not working**:
- Verify `VITE_ADMIN_PUBKEYS` is set correctly
- Check browser console for errors
- Ensure admin pubkey format is correct (64 hex chars)

**Build takes too long**:
- This is normal - build can take 5-10 minutes
- Memory usage is high due to image processing
- Workflow includes memory optimization

