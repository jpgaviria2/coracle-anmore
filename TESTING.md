# Testing Guide for Anmore

## Local Development Setup

### Prerequisites
- Node.js 20.x or higher
- pnpm 8 or higher
- Chrome browser (for Cypress tests)

### Initial Setup

1. **Install dependencies:**
   ```bash
   pnpm i
   pnpm i sharp --include=optional
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

3. **Start development server:**
   ```bash
   pnpm run dev
   ```
   The app will be available at `http://localhost:5173`

## Running Cypress Tests

### Test Modes

#### Headless Mode (Default)
Run all tests headlessly:
```bash
pnpm run test:e2e:headless
# or simply
pnpm run test:e2e
```

#### Headed Mode (Visible Browser)
Run tests with visible Chrome browser:
```bash
pnpm run test:e2e:headed
```

#### Debug Mode (Interactive UI)
Open Cypress UI for interactive testing:
```bash
pnpm run test:e2e:debug
```

#### Full Flow Test
Run only the complete end-to-end flow test:
```bash
pnpm run test:e2e:full
```

#### Watch Mode
Run tests in watch mode (re-runs on file changes):
```bash
pnpm run test:e2e:watch
```

### Test Files

- `cypress/e2e/nip05-signup.cy.ts` - NIP-05 signup flow tests
- `cypress/e2e/nip05-login.cy.ts` - NIP-05 login flow tests
- `cypress/e2e/posting.cy.ts` - Post creation and content tests
- `cypress/e2e/admin.cy.ts` - Admin feature tests
- `cypress/e2e/full-flow.cy.ts` - Complete end-to-end flow test
- `cypress/e2e/signup.cy.ts` - Updated signup tests
- `cypress/e2e/login.cy.ts` - Updated login tests

### Test Configuration

Tests are configured in `cypress.config.ts`:
- Base URL: `http://localhost:5173`
- Viewport: 1280x720
- Video recording: Enabled
- Screenshots: On failure
- Default timeout: 10 seconds

### Environment Variables for Tests

Set in `cypress.config.ts` or via environment:
- `NIP05_DOMAIN` - NIP-05 domain (default: "anmore.me")
- `DEFAULT_HASHTAG` - Default hashtag (default: "anmore")
- `ADMIN_NSEC` - Admin nsec for admin tests (optional)

## Test Coverage

### Automated Tests

✅ **NIP-05 Signup Flow**
- Username and password signup
- Key generation and display
- Email option functionality
- Password validation
- Saving encrypted nsec

✅ **NIP-05 Login Flow**
- Login with saved credentials
- Login with new nsec entry
- Password validation
- Error handling

✅ **Posting**
- Creating notes/posts
- Default hashtag addition
- Service listing creation
- Hashtag filtering

✅ **Admin Features**
- Admin dashboard access
- Hashtag whitelist management
- Adding/removing hashtags
- Non-admin access prevention

✅ **Full Flow**
- Complete user journey from signup to posting
- Admin flow (if configured)

### Manual Testing Required

The following areas require manual testing as they cannot be fully automated:

#### 1. Email Client Integration
- **What to test:** Click "Send nsec by Email" button
- **Expected:** Email client opens with pre-filled message containing credentials
- **How to test:**
  1. Complete signup flow
  2. Click "Send nsec by Email"
  3. Verify email client opens
  4. Verify email contains username, NIP-05, npub, nsec, and instructions

#### 2. NIP-05 Domain Verification
- **What to test:** Actual NIP-05 verification with `anmore.me` domain
- **Expected:** NIP-05 identifiers resolve correctly
- **How to test:**
  1. Set up NIP-05 verification on `anmore.me` domain
  2. Create account with NIP-05
  3. Verify NIP-05 resolves correctly
  4. Test login with NIP-05 identifier

#### 3. Relay Connectivity
- **What to test:** Data sync across relays
- **Expected:** Posts appear on all configured relays
- **How to test:**
  1. Configure multiple relays
  2. Create a post
  3. Verify post appears on all relays
  4. Test from different devices/clients

#### 4. Mobile Responsiveness
- **What to test:** UI on mobile devices
- **Expected:** All features work on mobile viewport
- **How to test:**
  1. Resize browser to mobile size (375x667)
  2. Test all major flows (signup, login, posting)
  3. Verify navigation and menus work correctly

#### 5. PWA Installation
- **What to test:** Progressive Web App installation
- **Expected:** App can be installed and works offline
- **How to test:**
  1. Open app in Chrome
  2. Click install prompt
  3. Verify app installs
  4. Test offline functionality

#### 6. Browser Extension Integration
- **What to test:** NIP-07 browser extension login
- **Expected:** Extension login works correctly
- **How to test:**
  1. Install Nostr browser extension
  2. Click "Use Browser Extension" on login page
  3. Verify login completes successfully

#### 7. Performance Testing
- **What to test:** Performance with large datasets
- **Expected:** App remains responsive
- **How to test:**
  1. Load feed with many posts
  2. Test scrolling and filtering
  3. Monitor memory usage
  4. Test with slow network connection

## Troubleshooting

### Tests Fail to Start

**Problem:** Cypress can't connect to `http://localhost:5173`

**Solution:**
1. Ensure dev server is running: `pnpm run dev`
2. Check port 5173 is not blocked
3. Verify baseUrl in `cypress.config.ts`

### Tests Timeout

**Problem:** Tests timeout waiting for elements

**Solution:**
1. Increase timeout in `cypress.config.ts`
2. Check if dev server is responding
3. Verify selectors match actual UI elements

### Video/Screenshot Not Generated

**Problem:** No videos or screenshots in `cypress/videos` or `cypress/screenshots`

**Solution:**
1. Check `video: true` in config
2. Verify write permissions on directories
3. Check disk space

### Admin Tests Fail

**Problem:** Admin tests fail with "Admin Dashboard not found"

**Solution:**
1. Set `ADMIN_NSEC` environment variable
2. Verify admin pubkey is in `VITE_ADMIN_PUBKEYS`
3. Check admin user is logged in correctly

## Best Practices

1. **Run tests before committing:**
   ```bash
   pnpm run test:e2e:headless
   ```

2. **Use headed mode for debugging:**
   ```bash
   pnpm run test:e2e:headed
   ```

3. **Test locally before pushing:**
   Always test the full flow locally before deploying

4. **Keep test data isolated:**
   Tests use random usernames to avoid conflicts

5. **Review test videos:**
   Check `cypress/videos` for failed test recordings

## Continuous Integration

For CI/CD pipelines, use:
```bash
pnpm run test:e2e:headless
```

This runs all tests headlessly and generates videos/screenshots for failed tests.

