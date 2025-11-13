# Anmore NIP-05 Backend Service

A lightweight Node.js/Express backend service for managing NIP-05 username-to-pubkey mappings with admin approval workflow.

## Features

- Accepts NIP-05 registration requests from the frontend
- Stores pending requests requiring admin approval
- Updates `.well-known/nostr.json` file when approved
- Serves the JSON file with proper CORS headers
- Provides admin endpoints for managing registrations

## Prerequisites

- Node.js v18 or higher
- npm or pnpm package manager
- Linux server (recommended) or any system running Node.js

## Installation

1. **Clone or copy the backend directory to your server**

2. **Install dependencies:**
   ```bash
   cd nip05-backend
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and set:
   ```bash
   PORT=3001
   DOMAIN=anmore.me
   ADMIN_API_KEY=your-secure-random-api-key-here
   DATA_DIR=./data
   ```
   
   **Important:** Generate a strong random string for `ADMIN_API_KEY`. You can use:
   ```bash
   openssl rand -hex 32
   ```

4. **Initialize data directory:**
   The service will automatically create the `data/` directory and initialize `nostr.json` and `pending.json` files on first run.

## Running the Service

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

### Using PM2 (Recommended for Production)
```bash
# Install PM2 globally
npm install -g pm2

# Start the service
pm2 start server.js --name anmore-nip05

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

### Using systemd (Linux)
Create `/etc/systemd/system/anmore-nip05.service`:
```ini
[Unit]
Description=Anmore NIP-05 Backend Service
After=network.target

[Service]
Type=simple
User=your-user
WorkingDirectory=/path/to/nip05-backend
Environment="NODE_ENV=production"
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Then:
```bash
sudo systemctl daemon-reload
sudo systemctl enable anmore-nip05
sudo systemctl start anmore-nip05
sudo systemctl status anmore-nip05
```

## API Endpoints

### Public Endpoints

#### GET `/.well-known/nostr.json`
Serves the NIP-05 mapping file with CORS headers.

**Response:**
```json
{
  "names": {
    "username1": "hex_pubkey1",
    "username2": "hex_pubkey2"
  }
}
```

#### POST `/api/register`
Submit a new NIP-05 registration request.

**Request Body:**
```json
{
  "username": "newuser",
  "pubkey": "64-character-hex-pubkey",
  "domain": "anmore.me"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration submitted successfully. Awaiting admin approval."
}
```

### Admin Endpoints (Require API Key)

All admin endpoints require the `Authorization` header:
```
Authorization: Bearer your-admin-api-key
```
or
```
Authorization: your-admin-api-key
```

#### GET `/api/admin/pending`
List all pending registration requests.

**Response:**
```json
{
  "success": true,
  "pending": [
    {
      "username": "newuser",
      "pubkey": "hex_pubkey",
      "domain": "anmore.me",
      "timestamp": "2025-01-XX...",
      "status": "pending"
    }
  ]
}
```

#### POST `/api/admin/approve`
Approve a registration request.

**Request Body:**
```json
{
  "username": "newuser",
  "pubkey": "hex_pubkey"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration approved for newuser@anmore.me"
}
```

#### POST `/api/admin/reject`
Reject a registration request.

**Request Body:**
```json
{
  "username": "newuser"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration rejected for newuser@anmore.me"
}
```

#### GET `/api/admin/registrations`
List all active registrations.

**Response:**
```json
{
  "success": true,
  "registrations": [
    {
      "username": "user1",
      "pubkey": "hex_pubkey1",
      "nip05": "user1@anmore.me"
    }
  ]
}
```

## Caddy Configuration

If you're using Caddy as your reverse proxy, configure it to route `/.well-known/nostr.json` to the backend service.

### Option 1: Caddyfile Configuration

Create or update your `Caddyfile`:
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
    
    # Other routes can proxy to frontend or serve static files
    reverse_proxy localhost:5173  # or your frontend port
}
```

### Option 2: Caddy API Configuration

You can also configure Caddy dynamically using its API:
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

## Frontend Configuration

Update your frontend `.env` file to include:
```bash
VITE_NIP05_API_URL=http://localhost:3001
```

For production, use your actual backend URL:
```bash
VITE_NIP05_API_URL=https://api.anmore.me
```
or if using same domain:
```bash
VITE_NIP05_API_URL=https://anmore.me
```

## Testing

### Test Registration Endpoint
```bash
curl -X POST http://localhost:3001/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "pubkey": "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
    "domain": "anmore.me"
  }'
```

### Test Admin Endpoints
```bash
# Get pending requests
curl -X GET http://localhost:3001/api/admin/pending \
  -H "Authorization: Bearer your-admin-api-key"

# Approve a request
curl -X POST http://localhost:3001/api/admin/approve \
  -H "Authorization: Bearer your-admin-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "pubkey": "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
  }'

# Verify NIP-05 file
curl http://localhost:3001/.well-known/nostr.json
```

### Test NIP-05 Lookup
Once approved, test with a Nostr client or:
```bash
curl https://anmore.me/.well-known/nostr.json?name=testuser
```

## Security Considerations

1. **API Key Security:**
   - Never commit `.env` file to version control
   - Use a strong, randomly generated API key
   - Rotate API keys periodically
   - Restrict admin endpoints to trusted IPs if possible

2. **File Permissions:**
   - Ensure the `data/` directory has appropriate permissions
   - The service should run as a non-root user

3. **Rate Limiting:**
   - Consider adding rate limiting to prevent abuse
   - Monitor registration requests for suspicious activity

4. **Backup:**
   - Regularly backup the `data/` directory
   - Consider version control for `nostr.json` (without sensitive data)

## Troubleshooting

### Service won't start
- Check Node.js version: `node --version` (should be v18+)
- Check if port is already in use: `lsof -i :3001`
- Verify `.env` file exists and has correct values

### Registration requests not appearing
- Check service logs for errors
- Verify API endpoint URL in frontend configuration
- Check CORS headers if accessing from different domain

### NIP-05 lookup fails
- Verify `nostr.json` file is being served correctly
- Check CORS headers are set properly
- Verify domain DNS points to correct server
- Test direct backend URL: `http://localhost:3001/.well-known/nostr.json`

### Admin endpoints return 401
- Verify `ADMIN_API_KEY` in `.env` matches the key in Authorization header
- Check Authorization header format (Bearer token or direct key)

## File Structure

```
nip05-backend/
├── server.js              # Main Express server
├── package.json           # Dependencies
├── .env                   # Environment variables (not in git)
├── .env.example          # Environment variables template
├── data/
│   ├── nostr.json        # Active NIP-05 mappings
│   └── pending.json      # Pending registration requests
└── README.md             # This file
```

## License

MIT

