# Hostinger Setup for NIP-05

## Step 1: Create the JSON File

**File to upload:** `/.well-known/nostr.json`

**File content:**
```json
{
  "names": {
    "jp": "b7a0bdc33b695f0960710e4a677c49189dab8833d5aa728498b6c2b9ec282d04"
  }
}
```

**Upload location:** `public_html/.well-known/nostr.json`

---

## Step 2: Create .htaccess File for CORS Headers

**File to upload:** `/.well-known/.htaccess`

**File content:**
```apache
<IfModule mod_headers.c>
    Header set Access-Control-Allow-Origin "*"
    Header set Access-Control-Allow-Methods "GET, OPTIONS"
    Header set Access-Control-Allow-Headers "Content-Type"
    Header set Content-Type "application/json"
</IfModule>

<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteCond %{REQUEST_METHOD} OPTIONS
    RewriteRule ^(.*)$ $1 [R=200,L]
</IfModule>
```

**Upload location:** `public_html/.well-known/.htaccess`

---

## Step 3: File Structure in Hostinger

Your file structure should look like this:

```
public_html/
└── .well-known/
    ├── nostr.json
    └── .htaccess
```

---

## Step 4: Upload Instructions

### Using Hostinger File Manager:

1. **Log into Hostinger hPanel**
2. **Go to File Manager**
3. **Navigate to `public_html` folder**
4. **Create `.well-known` folder** (if it doesn't exist)
   - Click "New Folder"
   - Name it `.well-known`
5. **Upload `nostr.json`:**
   - Go into `.well-known` folder
   - Click "Upload Files"
   - Upload `nostr.json` with the JSON content above
6. **Create `.htaccess` file:**
   - In `.well-known` folder, click "New File"
   - Name it `.htaccess` (with the dot at the beginning)
   - Paste the `.htaccess` content above
   - Save

### Using FTP/SFTP:

1. **Connect to your Hostinger FTP**
2. **Navigate to `public_html`**
3. **Create `.well-known` directory** (if it doesn't exist)
4. **Upload `nostr.json`** to `public_html/.well-known/nostr.json`
5. **Upload `.htaccess`** to `public_html/.well-known/.htaccess`

---

## Step 5: Verify File Permissions

Make sure files have correct permissions:
- **nostr.json**: `644` (readable by web server)
- **.htaccess**: `644` (readable by web server)
- **.well-known folder**: `755` (executable/readable)

In Hostinger File Manager, right-click files → "Change Permissions" → Set to `644` for files, `755` for folders.

---

## Step 6: Test

After uploading, test with:

```bash
curl -H "Origin: http://localhost:5173" -v https://anmore.me/.well-known/nostr.json?name=jp
```

Or test in browser console:
```javascript
fetch('https://anmore.me/.well-known/nostr.json?name=jp')
  .then(r => r.json())
  .then(data => console.log('Success:', data))
```

Should return:
```json
{
  "names": {
    "jp": "b7a0bdc33b695f0960710e4a677c49189dab8833d5aa728498b6c2b9ec282d04"
  }
}
```

---

## Troubleshooting

### File not found (404)
- Check file path is exactly `public_html/.well-known/nostr.json`
- Verify `.well-known` folder exists (it's a hidden folder, starts with dot)
- Check file permissions

### Still getting CORS error
- Verify `.htaccess` file exists in `.well-known` folder
- Check that `mod_headers` is enabled (should be by default on Hostinger)
- Clear browser cache
- Try accessing directly: `https://anmore.me/.well-known/nostr.json?name=jp`

### .htaccess not working
- Make sure file is named exactly `.htaccess` (with dot, no extension)
- Check file permissions (should be 644)
- Verify Apache is processing .htaccess files (should be enabled on Hostinger)

---

## Quick Checklist

- [ ] Created `.well-known` folder in `public_html`
- [ ] Uploaded `nostr.json` with correct content
- [ ] Created `.htaccess` file in `.well-known` folder
- [ ] Set file permissions to 644
- [ ] Tested with curl or browser
- [ ] Verified CORS headers are present

