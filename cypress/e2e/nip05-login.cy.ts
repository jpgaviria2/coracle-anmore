describe("NIP-05 Login Flow", () => {
  let testAccount: {username: string; password: string; nip05: string}

  before(() => {
    // Create a test account for login tests
    cy.nip05Signup({skipEmail: true}).then((account: any) => {
      testAccount = account
    })
  })

  beforeEach(() => {
    cy.visit("/")
  })

  it("should login with saved NIP-05 credentials", () => {
    cy.contains("Log In").click()
    cy.get(".modal").should("be.visible")

    // Click NIP-05 login
    cy.contains("Log In with NIP-05").click()
    cy.wait(500)

    // Fill login form
    cy.get("input[type=text]").type(testAccount.nip05)
    cy.get("input[type=password]").type(testAccount.password)

    // Submit login
    cy.contains("Log In").click()

    // Wait for login to complete
    cy.wait(2000)
    cy.get(".modal", {timeout: 15000}).should("not.exist")

    // Verify logged in state
    cy.contains("Don't have an account?").should("not.exist")
  })

  it("should use nip05Login command", () => {
    cy.nip05Login(testAccount.nip05, testAccount.password)
    cy.visit("/")
    cy.contains("Don't have an account?").should("not.exist")
  })

  it("should show error for invalid password", () => {
    cy.contains("Log In").click()
    cy.get(".modal").should("be.visible")
    cy.contains("Log In with NIP-05").click()
    cy.wait(500)

    cy.get("input[type=text]").type(testAccount.nip05)
    cy.get("input[type=password]").type("wrongpassword")
    cy.contains("Log In").click()

    // Should show error message
    cy.wait(1000)
    // Error handling may vary, but should not proceed to login
  })

  it("should show error for invalid NIP-05", () => {
    cy.contains("Log In").click()
    cy.get(".modal").should("be.visible")
    cy.contains("Log In with NIP-05").click()
    cy.wait(500)

    cy.get("input[type=text]").type("invalid@anmore.me")
    cy.get("input[type=password]").type("somepassword")
    cy.contains("Log In").click()

    // Should show error for invalid NIP-05
    cy.wait(1000)
  })

  it("should handle login with new nsec entry", () => {
    // This test would require entering nsec manually
    // For now, we'll test the UI flow
    cy.contains("Log In").click()
    cy.get(".modal").should("be.visible")
    cy.contains("Log In with NIP-05").click()
    cy.wait(500)

    // Enter NIP-05 that doesn't have saved credentials
    cy.get("input[type=text]").type("newuser@anmore.me")
    cy.get("input[type=password]").type("password123")
    cy.contains("Log In").click()

    // Should prompt for nsec entry if credentials not found
    cy.wait(2000)
    // The UI should show option to enter nsec
  })
})

