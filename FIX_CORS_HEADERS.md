# Fix CORS Headers for NIP-05 JSON File

Your `/.well-known/nostr.json` file exists but is missing CORS headers. Here's how to fix it for different web servers:

## Option 1: Apache (.htaccess)

Create or edit `/.well-known/.htaccess` file:

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

**Or** add to your main `.htaccess` file:

```apache
<IfModule mod_headers.c>
    <FilesMatch "\.well-known/nostr\.json$">
        Header set Access-Control-Allow-Origin "*"
        Header set Access-Control-Allow-Methods "GET, OPTIONS"
        Header set Access-Control-Allow-Headers "Content-Type"
        Header set Content-Type "application/json"
    </FilesMatch>
</IfModule>
```

## Option 2: Nginx

Add to your Nginx server configuration:

```nginx
location /.well-known/nostr.json {
    add_header Access-Control-Allow-Origin * always;
    add_header Access-Control-Allow-Methods "GET, OPTIONS" always;
    add_header Access-Control-Allow-Headers "Content-Type" always;
    add_header Content-Type "application/json" always;
    
    # Handle OPTIONS preflight requests
    if ($request_method = OPTIONS) {
        add_header Access-Control-Allow-Origin * always;
        add_header Access-Control-Allow-Methods "GET, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Content-Type" always;
        add_header Content-Type "application/json" always;
        add_header Access-Control-Max-Age 1728000;
        add_header Content-Type "text/plain charset=UTF-8";
        add_header Content-Length 0;
        return 204;
    }
    
    # Serve the JSON file
    try_files $uri =404;
}
```

## Option 3: Caddy

Add to your `Caddyfile`:

```
anmore.me {
    # NIP-05 endpoint with CORS
    handle /.well-known/nostr.json {
        header Access-Control-Allow-Origin *
        header Access-Control-Allow-Methods "GET, OPTIONS"
        header Access-Control-Allow-Headers "Content-Type"
        header Content-Type "application/json"
        file_server
    }
    
    # ... rest of your config
}
```

## Option 4: Cloudflare Pages/Workers

If using Cloudflare, add a `_headers` file in your site root:

```
/.well-known/nostr.json
  Access-Control-Allow-Origin: *
  Access-Control-Allow-Methods: GET, OPTIONS
  Access-Control-Allow-Headers: Content-Type
  Content-Type: application/json
```

## Option 5: Generic PHP (if using PHP)

Create `/.well-known/nostr.json.php`:

```php
<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Output your JSON
echo json_encode([
    'names' => [
        'jp' => 'b7a0bdc33b695f0960710e4a677c49189dab8833d5aa728498b6c2b9ec282d04'
    ]
]);
?>
```

## Option 6: Node.js/Express (if using Node.js)

```javascript
app.get('/.well-known/nostr.json', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'application/json');
    
    res.json({
        names: {
            jp: 'b7a0bdc33b695f0960710e4a677c49189dab8833d5aa728498b6c2b9ec282d04'
        }
    });
});

app.options('/.well-known/nostr.json', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.sendStatus(200);
});
```

## Testing CORS Headers

After adding headers, test with:

```bash
# Test GET request
curl -H "Origin: http://localhost:5173" \
     -H "Access-Control-Request-Method: GET" \
     -v https://anmore.me/.well-known/nostr.json?name=jp

# Test OPTIONS preflight
curl -X OPTIONS \
     -H "Origin: http://localhost:5173" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -v https://anmore.me/.well-known/nostr.json?name=jp
```

Look for these headers in the response:
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: GET, OPTIONS`
- `Content-Type: application/json`

## Quick Test in Browser

After configuring, open browser console and run:

```javascript
fetch('https://anmore.me/.well-known/nostr.json?name=jp')
  .then(r => r.json())
  .then(data => console.log('Success:', data))
  .catch(err => console.error('Error:', err))
```

Should work without CORS errors!

## Common Issues

### Headers not appearing
- Make sure the web server module is enabled (e.g., `mod_headers` for Apache)
- Check file permissions
- Restart/reload web server after changes

### Still getting CORS error
- Clear browser cache
- Check browser console for exact error
- Verify headers are being sent (use `curl -v`)

### 404 instead of CORS error
- File path is wrong - must be exactly `/.well-known/nostr.json`
- Check file exists and is readable

