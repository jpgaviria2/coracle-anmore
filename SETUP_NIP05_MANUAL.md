# Manual NIP-05 Setup for jp@anmore.me

## Step 1: Get Admin Pubkey from Nsec

Run this command to get your admin pubkey:

```bash
node get-admin-pubkey.js
```

Or manually in Node.js:
```bash
node -e "import('nostr-tools').then(m => import('nostr-tools/nip19').then(n => import('@noble/hashes/utils').then(u => { const nsec = 'nsec1sf3mrw27p5t4pputmq65aze82v8ma4n9pmkcgnfptsmqyrw5kvtshssymq'; const hex = n.nsecDecode(nsec); const bytes = u.hexToBytes(hex); const pubkey = m.getPublicKey(bytes); console.log('Admin pubkey:', pubkey); })))"
```

**Save the pubkey output - you'll need it in Step 2.**

## Step 2: Create `.well-known/nostr.json` File

On your domain hosting (anmore.me), create this file structure:

```
anmore.me/
└── .well-known/
    └── nostr.json
```

### File Content:

Create `/.well-known/nostr.json` with this content:

```json
{
  "names": {
    "jp": "YOUR_ADMIN_PUBKEY_HEX_HERE"
  }
}
```

Replace `YOUR_ADMIN_PUBKEY_HEX_HERE` with the pubkey from Step 1.

**Important:** 
- The pubkey must be exactly 64 hexadecimal characters (lowercase)
- No extra spaces or quotes around the pubkey value
- The file must be valid JSON

### Example:

If your pubkey is `0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef`, the file should be:

```json
{
  "names": {
    "jp": "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
  }
}
```

## Step 3: Set CORS Headers (if needed)

If you're getting CORS errors, you need to configure your web server to add CORS headers.

### For Apache (.htaccess):

Create or edit `.well-known/.htaccess`:

```apache
<IfModule mod_headers.c>
    Header set Access-Control-Allow-Origin "*"
    Header set Access-Control-Allow-Methods "GET, OPTIONS"
    Header set Access-Control-Allow-Headers "Content-Type"
</IfModule>
```

### For Nginx:

Add to your nginx config:

```nginx
location /.well-known/nostr.json {
    add_header Access-Control-Allow-Origin *;
    add_header Access-Control-Allow-Methods "GET, OPTIONS";
    add_header Content-Type application/json;
}
```

### For Caddy:

Add to your Caddyfile:

```
anmore.me {
    handle /.well-known/nostr.json {
        header Access-Control-Allow-Origin *
        header Content-Type application/json
        file_server
    }
    
    # ... rest of your config
}
```

## Step 4: Set Correct Content-Type

Make sure the file is served with `Content-Type: application/json` header.

## Step 5: Test

1. **Test from command line:**
   ```bash
   curl https://anmore.me/.well-known/nostr.json?name=jp
   ```

   Should return:
   ```json
   {
     "names": {
       "jp": "your-pubkey-hex"
     }
   }
   ```

2. **Test from browser:**
   Open: `https://anmore.me/.well-known/nostr.json?name=jp`
   
   Should see the JSON response.

3. **Test CORS:**
   ```bash
   curl -H "Origin: http://localhost:5173" \
        -H "Access-Control-Request-Method: GET" \
        -X OPTIONS \
        https://anmore.me/.well-known/nostr.json?name=jp \
        -v
   ```
   
   Should see `Access-Control-Allow-Origin: *` in headers.

4. **Test login in Anmore app:**
   - Go to `http://localhost:5173/login/nip05`
   - Enter: `jp@anmore.me`
   - Enter your password
   - Click "Log In"
   - It should now resolve the NIP-05 and log you in!

## Troubleshooting

### 404 Not Found
- Verify the file path is exactly: `/.well-known/nostr.json`
- Check file permissions (should be readable by web server)
- Some hosts require `.well-known` folder to be created first

### CORS Error
- Make sure CORS headers are set (see Step 3)
- Verify headers are being sent (check with `curl -v`)

### Invalid JSON
- Validate JSON syntax at https://jsonlint.com/
- Make sure there are no trailing commas
- Ensure pubkey is exactly 64 hex characters

### Wrong Pubkey Format
- Must be hex (64 characters), not npub format
- Must be lowercase
- No spaces or special characters

## Adding More Users Later

To add more users, just add them to the `names` object:

```json
{
  "names": {
    "jp": "admin-pubkey-hex",
    "user1": "user1-pubkey-hex",
    "user2": "user2-pubkey-hex"
  }
}
```

## Quick Reference

**File Location:** `/.well-known/nostr.json`

**File Format:**
```json
{
  "names": {
    "username": "64-character-hex-pubkey"
  }
}
```

**Required Headers:**
- `Content-Type: application/json`
- `Access-Control-Allow-Origin: *` (for CORS)

**Test Command:**
```bash
curl https://anmore.me/.well-known/nostr.json?name=jp
```

