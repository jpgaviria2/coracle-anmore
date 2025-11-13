// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import "./commands"
import "./test-helpers"

// Handle uncaught exceptions from the app
Cypress.on("uncaught:exception", (err, runnable) => {
  // Ignore errors related to module imports during Vite dev server startup
  if (err.message.includes("does not provide an export") || 
      err.message.includes("generatePrivateKey") ||
      err.message.includes("generateSecretKey")) {
    return false // prevent Cypress from failing the test
  }
  // return true to let other errors fail the test
  return true
})

// Alternatively you can use CommonJS syntax:
// require('./commands')
