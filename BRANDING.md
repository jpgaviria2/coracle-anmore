# Anmore Branding Guide

This guide documents all branding assets and customization options for the Anmore platform.

## Required Assets

### Logo Files

All logo files should be placed in `public/images/`:

- **`logo.png`** - Main logo (square format, transparent background)
  - Recommended size: 512x512px
  - Format: PNG with transparency
  - Used in: App header, PWA icons (if no separate icon set)

- **`wordmark-dark.png`** - Wordmark for dark theme
  - Recommended size: 400x100px (aspect ratio 4:1)
  - Format: PNG with transparency
  - Used in: Header, navigation, dark mode UI

- **`wordmark-light.png`** - Wordmark for light theme
  - Recommended size: 400x100px (aspect ratio 4:1)
  - Format: PNG with transparency
  - Used in: Header, navigation, light mode UI

### Favicon/Icons (PWA)

Icons are generated using [pwa-asset-generator](https://github.com/elegantapp/pwa-asset-generator) and placed in two locations:

**`public/images/`** - Contains:
- **`manifest-icon-192.maskable.png`** - 192x192px (PWA manifest)
- **`manifest-icon-512.maskable.png`** - 512x512px (PWA manifest)
- **`apple-icon-180.png`** - 180x180px (Apple touch icon)
- **`favicon-196.png`** - 196x196px (Favicon)
- **`apple-splash-*.png`** - All iOS splash screen images for various device sizes

**`public/icons/`** - Contains:
- **`favicon.ico`** - Multi-size favicon
- **`favicon-16x16.png`**, **`favicon-32x32.png`**, **`favicon-48x48.png`** - Standard favicon sizes
- **`apple-touch-icon-*.png`** - Various Apple touch icon sizes (57x57, 60x60, 72x72, 76x76, 114x114, 120x120, 144x144, 152x152, 167x167, 180x180)
- **`android-chrome-*.png`** - Android Chrome icons (36x36, 48x48, 72x72, 96x96, 144x144, 192x192, 256x256, 384x384, 512x512)
- **`mstile-*.png`** - Microsoft tile icons (70x70, 144x144, 150x150, 310x150, 310x310)

**Icon Generation**: Icons are automatically generated from `public/images/logo.png` using:
```bash
# Generate icons and favicons
pnpm exec pwa-asset-generator public/images/logo.png public/images --icon-only --favicon --type png --opaque false --index index.html --manifest public/manifest.webmanifest

# Generate splash screens
pnpm exec pwa-asset-generator public/images/logo.png public/images --splash-only --background "#000000" --type png --index index.html

# Generate additional icon sizes for icons folder
pnpm exec pwa-asset-generator public/images/logo.png public/icons --icon-only --type png --opaque false --path /icons
```

### Banner/Header

- **`banner.png`** - Header banner image
  - Recommended size: 1920x400px (aspect ratio ~4.8:1)
  - Format: PNG or JPG
  - Used in: Homepage header, landing pages

## Configuration Files

### Environment Variables

Set these in your `.env` file (never commit `.env` to git):

```bash
# Application Branding
VITE_APP_NAME=Anmore
VITE_APP_URL=https://anmore.me
VITE_APP_LOGO=/images/logo.png

# Nostr Client Information
VITE_CLIENT_NAME=anmore
VITE_CLIENT_ID=anmore

# NIP-05 Domain
VITE_NIP05_DOMAIN=anmore.me

# Default Hashtag (automatically added to all new content)
VITE_DEFAULT_HASHTAG=anmore

# Admin Nsec (never commit this!)
VITE_ADMIN_NSEC=nsec1...
```

### Package.json

Update these fields in `package.json`:

```json
{
  "name": "anmore",
  "description": "Anmore - Community platform built on Nostr",
  "version": "0.6.26"
}
```

### HTML Meta Tags

Update `index.html`:

```html
<title>Anmore</title>
<meta name="description" content="Anmore - Community platform built on Nostr" />
```

### PWA Manifest

Update `public/manifest.webmanifest`:

```json
{
  "name": "Anmore",
  "short_name": "Anmore",
  "description": "Community platform built on Nostr",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#000000",
  "theme_color": "#your-theme-color",
  "icons": [
    {
      "src": "/icons/icon-192.webp",
      "sizes": "192x192",
      "type": "image/webp",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512.webp",
      "sizes": "512x512",
      "type": "image/webp",
      "purpose": "any maskable"
    }
  ]
}
```

## Color Customization

### CSS Variables

The application uses CSS variables for theming. You can customize colors in `src/app.css`:

```css
:root {
  /* Primary Colors */
  --color-accent: #your-accent-color;
  --color-accent-d: #darker-accent-color;
  
  /* Background Colors */
  --color-bg: #000000;
  --color-bg-secondary: #1a1a1a;
  
  /* Text Colors */
  --color-text: #ffffff;
  --color-text-secondary: #a0a0a0;
  
  /* Border Colors */
  --color-border: #333333;
}
```

### Tailwind Configuration

Colors can also be customized in `tailwind.config.cjs`:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: '#your-accent-color',
          d: '#darker-accent-color',
        },
      },
    },
  },
}
```

## Asset Checklist

Use this checklist when setting up branding:

- [ ] Logo files created (`logo.png`, `wordmark-dark.png`, `wordmark-light.png`)
- [ ] PWA icons generated (all sizes in `public/icons/`)
- [ ] Banner image created (`banner.png`)
- [ ] Environment variables configured (`.env` file)
- [ ] `package.json` updated with app name and description
- [ ] `index.html` meta tags updated
- [ ] `manifest.webmanifest` configured
- [ ] Colors customized in CSS/Tailwind config
- [ ] Test PWA installation (icons display correctly)
- [ ] Test dark/light theme (wordmarks display correctly)
- [ ] Verify all assets load correctly in production build

## Logo Placement Guidelines

### Header/Navigation
- Use wordmark (dark or light based on theme)
- Maximum height: 40px
- Maintain aspect ratio

### Favicon
- Use square logo or icon
- Should be recognizable at small sizes (16x16px)
- Consider simplified version for favicon

### PWA Icons
- Use full logo or simplified icon
- Ensure it looks good on both light and dark backgrounds
- Test on various devices (iOS, Android, desktop)

## File Structure

```
public/
├── images/
│   ├── logo.png
│   ├── wordmark-dark.png
│   ├── wordmark-light.png
│   ├── banner.png
│   ├── manifest-icon-192.maskable.png
│   ├── manifest-icon-512.maskable.png
│   ├── apple-icon-180.png
│   ├── favicon-196.png
│   └── apple-splash-*.png (40+ splash screen images)
├── icons/
│   ├── favicon.ico
│   ├── favicon-*.png (16x16, 32x32, 48x48)
│   ├── apple-touch-icon-*.png (multiple sizes)
│   ├── android-chrome-*.png (multiple sizes)
│   └── mstile-*.png (multiple sizes)
└── manifest.webmanifest
```

## Testing Branding

After updating branding assets:

1. **Clear browser cache** - Old assets may be cached
2. **Test in incognito/private mode** - Ensures fresh load
3. **Test PWA installation** - Verify icons display correctly
4. **Test theme switching** - Verify correct wordmark shows
5. **Test on mobile devices** - Verify responsive behavior
6. **Check console for 404 errors** - Ensure all assets load

## Security Notes

- **Never commit `.env` file** - Contains sensitive information (admin nsec, API keys)
- **Never commit real admin nsec** - Use placeholder in `.env.example`
- **Review `manifest.webmanifest`** - Ensure it doesn't expose sensitive information
- **Verify asset paths** - Ensure no absolute paths expose server structure

## Additional Resources

- [PWA Best Practices](https://web.dev/pwa-checklist/)
- [Favicon Best Practices](https://web.dev/add-manifest/)
- [Nostr Client Naming](https://github.com/nostr-protocol/nips/blob/master/89.md)

