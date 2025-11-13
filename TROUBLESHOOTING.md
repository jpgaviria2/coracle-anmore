# Troubleshooting GitHub Pages Deployment

## Issue: Site Not Showing After Deployment

### Check 1: Verify Workflow Completed Successfully
1. Go to: https://github.com/jpgaviria2/coracle-anmore/actions
2. Click on the latest "Deploy to GitHub Pages" workflow run
3. Check if both `build` and `deploy` jobs completed successfully (green checkmarks)
4. If any job failed (red X), click on it to see error details

### Check 2: Verify GitHub Pages Settings
1. Repository Settings → Pages
2. Source should be: **"GitHub Actions"** (not "Deploy from a branch")
3. If it says "Deploy from a branch", change it to "GitHub Actions" and save

### Check 3: Check Build Output
In the workflow logs, look for the "List build output" step. It should show:
- `dist/` folder exists
- `dist/index.html` exists
- Other files in dist/

### Check 4: Verify Deployment
1. In the workflow, check the "Deploy to GitHub Pages" step
2. Look for the deployment URL in the output
3. It should show something like: `https://jpgaviria2.github.io/coracle-anmore/`

### Check 5: Clear Browser Cache
- The site might be cached
- Try opening in incognito/private mode
- Or hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

### Check 6: Check Custom Domain (if using)
- If using `anmore.me`, verify DNS is configured correctly
- CNAME record should point to: `jpgaviria2.github.io`
- Wait for DNS propagation (can take up to 48 hours)

## Common Issues

### Build Fails with "Environment Variable Not Found"
- **Solution**: The workflow now includes all required environment variables
- If still failing, check the workflow file has all env vars set

### Build Succeeds but Site Shows 404
- **Possible causes**:
  1. GitHub Pages not set to "GitHub Actions" source
  2. Deployment job didn't run
  3. Wrong base path (if not using custom domain)

### Site Shows but is Blank/White
- **Possible causes**:
  1. JavaScript errors (check browser console)
  2. Missing assets (check Network tab)
  3. Base path issues

### Workflow Not Running
- **Check**:
  1. Is it pushed to `main` or `master` branch?
  2. Is the workflow file in `.github/workflows/`?
  3. Check repository Actions tab is enabled

## Manual Verification Steps

1. **Check Workflow File**:
   ```bash
   cat .github/workflows/deploy.yml
   ```

2. **Check CNAME File**:
   ```bash
   cat CNAME
   # Should show: anmore.me
   ```

3. **Test Build Locally**:
   ```bash
   pnpm i
   pnpm i sharp --include=optional
   pnpm run build
   ls -la dist/
   # Should see index.html and other files
   ```

## Getting Help

If the site still doesn't work:
1. Check the Actions tab for error messages
2. Check browser console for JavaScript errors
3. Verify all environment variables are set in the workflow
4. Make sure GitHub Pages is enabled and set to "GitHub Actions"

