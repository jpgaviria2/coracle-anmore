// Test helper utilities for Cypress E2E tests

/**
 * Generate a random username for testing
 */
export function generateRandomUsername(): string {
  return `testuser${Math.random().toString(36).substring(2, 11)}`
}

/**
 * Generate a random password for testing
 */
export function generateRandomPassword(): string {
  return `TestPass${Math.random().toString(36).substring(2, 15)}!`
}

/**
 * Generate a test NIP-05 identifier
 */
export function generateTestNip05(domain: string = "anmore.me"): string {
  return `${generateRandomUsername()}@${domain}`
}

// Note: These helper functions are exported but may not be used directly in Cypress commands
// They're available for use in test files if needed

/**
 * Get environment variable with fallback
 */
export function getEnvVar(key: string, defaultValue: string = ""): string {
  return Cypress.env(key) || defaultValue
}

/**
 * Generate test post content
 */
export function generateTestPostContent(): string {
  return `Test post ${Math.random().toString(36).substring(2, 9)} #anmore #test`
}

/**
 * Generate test service listing data
 */
export function generateTestServiceData() {
  return {
    title: `Test Service ${Math.random().toString(36).substring(2, 9)}`,
    summary: "Test service summary",
    description: "This is a test service description",
    category: "Technology",
    serviceType: "Remote",
    location: "Remote",
    price: "100000",
    businessHours: "Mon-Fri 9am-5pm",
  }
}

