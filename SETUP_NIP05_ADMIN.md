# Setup NIP-05 for Admin Account (jp@anmore.me)

## Step 1: Get Admin Pubkey from Nsec

You need to convert your admin nsec to a pubkey (hex format). You can do this using Node.js:

```bash
node -e "const {getPublicKey} = require('nostr-tools'); const {nsecDecode} = require('nostr-tools/nip19'); const {hexToBytes} = require('@noble/hashes/utils'); const nsec = 'YOUR_ADMIN_NSEC_HERE'; const hex = nsecDecode(nsec); const bytes = hexToBytes(hex); const pubkey = getPublicKey(bytes); console.log('Admin pubkey (hex):', pubkey);"
```

Or use this simpler method - run this in your browser console on the Anmore app (when logged in as admin):

```javascript
// In browser console at http://localhost:5173
import {getPublicKey} from 'nostr-tools'
import {nsecDecode} from 'nostr-tools/nip19'
import {hexToBytes} from '@noble/hashes/utils'

const adminNsec = 'nsec1sf3mrw27p5t4pputmq65aze82v8ma4n9pmkcgnfptsmqyrw5kvtshssymq'
const hex = nsecDecode(adminNsec)
const bytes = hexToBytes(hex)
const pubkey = getPublicKey(bytes)
console.log('Admin pubkey (hex):', pubkey)
```

**Save this pubkey - you'll need it in Step 3.**

## Step 2: Set Up NIP-05 Backend Server

### On Your Linux Server:

1. **Navigate to the backend directory:**
   ```bash
   cd /path/to/coracle-anmore/nip05-backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env` file:**
   ```bash
   cp .env.example .env
   nano .env
   ```

4. **Configure `.env`:**
   ```bash
   PORT=3001
   DOMAIN=anmore.me
   ADMIN_API_KEY=your-secure-random-api-key-here
   DATA_DIR=./data
   ```

   **Generate a secure API key:**
   ```bash
   openssl rand -hex 32
   ```
   Copy the output and use it as `ADMIN_API_KEY`.

5. **Start the backend server:**
   ```bash
   # For testing
   npm run dev
   
   # For production (using PM2)
   npm install -g pm2
   pm2 start server.js --name anmore-nip05
   pm2 save
   pm2 startup
   ```

6. **Verify server is running:**
   ```bash
   curl http://localhost:3001/health
   ```
   Should return: `{"status":"ok","service":"anmore-nip05-backend"}`

## Step 3: Manually Add Admin Account

Since you're the admin, you can directly add your account to `nostr.json`:

1. **Edit the nostr.json file:**
   ```bash
   nano nip05-backend/data/nostr.json
   ```

2. **Add your admin account:**
   ```json
   {
     "names": {
       "jp": "YOUR_ADMIN_PUBKEY_HEX_HERE"
     }
   }
   ```

   Replace `YOUR_ADMIN_PUBKEY_HEX_HERE` with the pubkey from Step 1.

3. **Verify the file:**
   ```bash
   cat nip05-backend/data/nostr.json
   ```

4. **Test the endpoint:**
   ```bash
   curl http://localhost:3001/.well-known/nostr.json?name=jp
   ```
   
   Should return:
   ```json
   {
     "names": {
       "jp": "your-pubkey-hex"
     }
   }
   ```

## Step 4: Configure Caddy

### Option A: Caddyfile Configuration (Recommended)

1. **Edit your Caddyfile:**
   ```bash
   sudo nano /etc/caddy/Caddyfile
   ```

2. **Add this configuration:**
   ```
   anmore.me {
       # Route NIP-05 endpoint to backend
       handle /.well-known/nostr.json {
           reverse_proxy localhost:3001 {
               header Access-Control-Allow-Origin *
           }
       }
       
       # Route API endpoints to backend
       handle /api/* {
           reverse_proxy localhost:3001
       }
       
       # Route everything else to your frontend
       reverse_proxy localhost:5173  # or your frontend port
   }
   ```

3. **Reload Caddy:**
   ```bash
   sudo systemctl reload caddy
   # or
   sudo caddy reload --config /etc/caddy/Caddyfile
   ```

### Option B: Caddy API Configuration

If you're using Caddy's API:

```bash
curl -X POST http://localhost:2019/config/apps/http/servers/srv0/routes \
  -H "Content-Type: application/json" \
  -d '{
    "match": [{"path": ["/.well-known/nostr.json"]}],
    "handle": [{
      "handler": "reverse_proxy",
      "upstreams": [{"dial": "localhost:3001"}],
      "headers": {
        "response": {
          "set": {
            "Access-Control-Allow-Origin": ["*"]
          }
        }
      }
    }]
  }'
```

## Step 5: Test NIP-05 Lookup

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

3. **Test login in Anmore app:**
   - Go to `http://localhost:5173/login/nip05`
   - Enter: `jp@anmore.me`
   - Enter your password
   - Click "Log In"
   - It should now resolve the NIP-05 and log you in!

## Step 6: Update Frontend Configuration (if needed)

If your backend is on a different server, update your frontend `.env`:

```bash
VITE_NIP05_API_URL=https://anmore.me
# or if backend is on separate domain:
VITE_NIP05_API_URL=https://api.anmore.me
```

## Troubleshooting

### CORS Error
- Make sure Caddy is adding `Access-Control-Allow-Origin: *` header
- Verify backend server has CORS enabled (it does by default)

### 404 Not Found
- Check that Caddy is routing `/.well-known/nostr.json` to `localhost:3001`
- Verify backend server is running: `curl http://localhost:3001/health`
- Check Caddy logs: `sudo journalctl -u caddy -f`

### Invalid Pubkey
- Make sure the pubkey in `nostr.json` is exactly 64 hex characters (lowercase)
- Verify you used the hex pubkey, not the npub format

### Backend Not Starting
- Check Node.js version: `node --version` (should be v18+)
- Check if port 3001 is in use: `lsof -i :3001`
- Check backend logs: `pm2 logs anmore-nip05` or check console output

## Quick Reference Commands

```bash
# Check backend health
curl http://localhost:3001/health

# View nostr.json
cat nip05-backend/data/nostr.json

# View pending registrations (requires API key)
curl -X GET http://localhost:3001/api/admin/pending \
  -H "Authorization: Bearer YOUR_ADMIN_API_KEY"

# Test NIP-05 lookup
curl https://anmore.me/.well-known/nostr.json?name=jp

# Restart backend (PM2)
pm2 restart anmore-nip05

# View backend logs
pm2 logs anmore-nip05
```

