import {
  generateRandomUsername,
  generateRandomPassword,
  generateTestPostContent,
  generateTestServiceData,
} from "./test-helpers"

const nsec = "nsec1er8narhat3xjypf46pksxlr6k4jrmv2e9psazjk0adynly0l4ltsepvmy5"

// Legacy login command (kept for backward compatibility)
Cypress.Commands.add("login", () => {
  cy.session(
    nsec,
    () => {
      cy.visit("/login/privkey")
      cy.get("input[type=password]").type(nsec, {log: false})
      cy.get(".cy-login-submit").click()
      cy.get(".modal", {timeout: 10_000}).should("not.exist")
      cy.contains("Don't have an account?").should("not.exist")
    },
    {
      validate: () => {
        let pubkey

        cy.window()
          .then(w => {
            pubkey = w.pubkey.get()
          })
          .then(() => {
            expect(pubkey).to.equal(
              "c853d879b7376dab1cdcd4faf235a05f680aae42ba620abdd95d619542a5a379"
            )
          })
      },
    }
  )
})

// NIP-05 Signup command
Cypress.Commands.add("nip05Signup", (options: {username?: string; password?: string; skipEmail?: boolean} = {}) => {
  const username = options.username || generateRandomUsername()
  const password = options.password || generateRandomPassword()
  const nip05Domain = Cypress.env("NIP05_DOMAIN") || "anmore.me"
  const nip05 = `${username}@${nip05Domain}`

  cy.session(
    `nip05-signup-${username}`,
    () => {
      cy.visit("/signup")
      cy.wait(1000)
      
      // Skip intro if present, or go directly to keys step
      cy.get("body").then(($body) => {
        if ($body.find("button:contains('Let's go!')").length > 0) {
          cy.contains("Let's go!").click()
          cy.wait(1000)
        }
      })
      
      // Click on NIP-05 signup option
      cy.contains("Create Account with NIP-05", {timeout: 10000}).click()
      cy.wait(1000)
      
      // Fill in signup form
      cy.get("input[type=text]").first().should("be.visible").type(username)
      cy.get("input[type=password]").eq(0).should("be.visible").type(password)
      cy.get("input[type=password]").eq(1).should("be.visible").type(password)
      
      // Generate keys
      cy.contains("Generate Keys").click()
      cy.wait(3000)
      
      // Verify keys are generated
      cy.contains("Keys Generated Successfully!", {timeout: 15000}).should("be.visible")
      cy.contains("Private Key (nsec)", {timeout: 10000}).should("be.visible")
      
      // Skip email option if requested
      if (options.skipEmail) {
        cy.contains("I've Saved My Keys - Continue", {timeout: 10000}).click()
      } else {
        // Optionally test email flow
        cy.contains("Send nsec by Email", {timeout: 10000}).click()
        cy.wait(500)
        // Skip email for automated tests
        cy.contains("Skip").click()
        cy.wait(500)
        cy.contains("I've Saved My Keys - Continue").click()
      }
      
      // Wait for login to complete and onboarding to start
      cy.wait(3000)
      // May show onboarding modal or close completely
      cy.get("body").then(($body) => {
        // If onboarding modal appears, we can skip it or continue
        if ($body.find(".modal").length > 0) {
          // Try to skip onboarding if possible
          cy.get("body").then(($body2) => {
            if ($body2.find("button:contains('Skip')").length > 0) {
              cy.contains("Skip").click()
            }
          })
        }
      })
    },
    {
      validate: () => {
        cy.window().then(w => {
          // Check if session exists
          const hasSession = w.session?.get() || w.pubkey?.get()
          expect(hasSession).to.exist
        })
      },
    }
  )

  return cy.wrap({username, password, nip05})
})

// NIP-05 Login command
Cypress.Commands.add("nip05Login", (nip05: string, password: string) => {
  cy.session(
    `nip05-login-${nip05}`,
    () => {
      cy.visit("/login")
      cy.wait(1000)
      cy.get(".modal", {timeout: 10000}).should("be.visible")
      
      // Click NIP-05 login
      cy.contains("Log In with NIP-05", {timeout: 10000}).click()
      cy.wait(1000)
      
      // Fill login form
      cy.get("input[type=text]").should("be.visible").type(nip05)
      cy.get("input[type=password]").should("be.visible").type(password)
      
      // Submit login
      cy.contains("Log In").click()
      
      // Wait for login to complete
      cy.wait(3000)
      // Modal should close or show success
      cy.get("body").then(($body) => {
        // Check if modal is gone or if we're logged in
        const modalExists = $body.find(".modal").length > 0
        if (modalExists) {
          // Wait a bit more for login to process
          cy.wait(2000)
        }
      })
    },
    {
      validate: () => {
        cy.window().then(w => {
          // Check if session or pubkey exists
          const hasSession = w.session?.get() || w.pubkey?.get()
          expect(hasSession).to.exist
        })
      },
    }
  )
})

// Admin login command
Cypress.Commands.add("adminLogin", (adminNsec: string) => {
  cy.session(
    `admin-login-${adminNsec}`,
    () => {
      cy.visit("/login/privkey")
      cy.get("input[type=password]").type(adminNsec, {log: false})
      cy.get(".cy-login-submit").click()
      cy.get(".modal", {timeout: 10_000}).should("not.exist")
      
      // Verify admin access
      cy.visit("/admin")
      cy.contains("Admin Dashboard", {timeout: 10000}).should("be.visible")
    },
    {
      validate: () => {
        cy.window().then(w => {
          const session = w.session?.get()
          expect(session).to.exist
        })
      },
    }
  )
})

// Create a post/note
Cypress.Commands.add("createPost", (content?: string) => {
  const postContent = content || generateTestPostContent()
  
  cy.visit("/notes/create")
  cy.wait(1000)
  
  // Find the editor and type content
  cy.get(".ProseMirror", {timeout: 10000}).should("be.visible").type(postContent)
  
  // Submit the post
  cy.contains("Publish").click()
  
  // Wait for post to be published
  cy.wait(2000)
  cy.get(".modal", {timeout: 15000}).should("not.exist")
  
  return cy.wrap({content: postContent})
})

// Create a service listing
Cypress.Commands.add("createService", (serviceData?: any) => {
  const data = serviceData || generateTestServiceData()
  
  cy.visit("/services/create")
  cy.wait(1000)
  
  // Fill in service form
  cy.get("input[type=text]").eq(0).type(data.title)
  if (data.summary) {
    cy.get("input[type=text]").eq(1).type(data.summary)
  }
  
  // Type description in editor
  cy.get(".ProseMirror", {timeout: 10000}).should("be.visible").type(data.description)
  
  // Fill optional fields
  if (data.category) {
    cy.get("input[type=text]").contains("Category").parent().find("input").type(data.category)
  }
  if (data.location) {
    cy.get("input[type=text]").contains("Location").parent().find("input").type(data.location)
  }
  if (data.price) {
    cy.get("input[type=text]").contains("Price").parent().find("input").type(data.price)
  }
  
  // Submit
  cy.contains("Publish Service Listing").click()
  
  // Wait for submission
  cy.wait(2000)
  cy.get(".modal", {timeout: 15000}).should("not.exist")
  
  return cy.wrap(data)
})

// Generate test account helper
Cypress.Commands.add("generateTestAccount", () => {
  const username = generateRandomUsername()
  const password = generateRandomPassword()
  const nip05Domain = Cypress.env("NIP05_DOMAIN") || "anmore.me"
  const nip05 = `${username}@${nip05Domain}`
  
  return cy.wrap({username, password, nip05})
})
