# Admin Hashtag Whitelist Configuration

The admin hashtag whitelist is now stored at the application level instead of publishing to Nostr relays. This prevents relay spam and keeps configuration local.

## Configuration

### Environment Variable

Add to your `.env` file:

```bash
VITE_ADMIN_HASHTAG_WHITELIST=anmore,bitcoin,nostr
```

**Format:** Comma-separated list of hashtags (without #)

**Example:**
```bash
VITE_ADMIN_HASHTAG_WHITELIST=anmore,bitcoin,nostr,lightning
```

### Runtime Updates

When you add/remove hashtags in the admin UI, they are saved to `localStorage` for immediate use. However, to persist across deployments, update the `.env` file.

**Priority:**
1. `localStorage` (if exists) - for runtime updates
2. `VITE_ADMIN_HASHTAG_WHITELIST` env var - for persistent configuration
3. Empty set (show all hashtags) - if neither exists

## Usage

1. **Set initial whitelist in `.env`:**
   ```bash
   VITE_ADMIN_HASHTAG_WHITELIST=anmore,bitcoin
   ```

2. **Add hashtags via Admin UI:**
   - Go to Admin → Hashtag Management
   - Add hashtags as needed
   - Changes are saved to localStorage immediately

3. **Persist changes to `.env`:**
   - After adding hashtags in UI, update `.env` file
   - Restart dev server or rebuild for changes to take effect

## Benefits

- ✅ No relay spam - whitelist stays local
- ✅ Fast - no network requests needed
- ✅ Persistent - stored in .env for deployments
- ✅ Runtime updates - localStorage for immediate changes
- ✅ Simple - comma-separated list format

## Migration

If you previously published hashtag whitelist to Nostr:
1. The old Nostr events are ignored
2. Set `VITE_ADMIN_HASHTAG_WHITELIST` in `.env`
3. Add hashtags via Admin UI (saved to localStorage)
4. Update `.env` to match your current whitelist

