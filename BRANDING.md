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

All icon files should be placed in `public/icons/`:

These icons are used for Progressive Web App (PWA) installation and browser favicons. All should be in WebP format for optimal performance:

- **`icon-48.webp`** - 48x48px
- **`icon-72.webp`** - 72x72px
- **`icon-96.webp`** - 96x96px
- **`icon-128.webp`** - 128x128px
- **`icon-192.webp`** - 192x192px (PWA home screen icon)
- **`icon-256.webp`** - 256x256px
- **`icon-512.webp`** - 512x512px (PWA splash screen)

**Icon Generation**: You can use tools like:
- [PWA Asset Generator](https://github.com/elegantapp/pwa-asset-generator)
- [RealFaviconGenerator](https://realfavicongenerator.net/)
- [Favicon.io](https://favicon.io/)

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
│   └── banner.png
├── icons/
│   ├── icon-48.webp
│   ├── icon-72.webp
│   ├── icon-96.webp
│   ├── icon-128.webp
│   ├── icon-192.webp
│   ├── icon-256.webp
│   └── icon-512.webp
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

