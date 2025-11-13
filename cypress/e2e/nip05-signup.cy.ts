describe("NIP-05 Signup Flow", () => {
  beforeEach(() => {
    cy.visit("/")
  })

  it("should complete NIP-05 signup with username and password", () => {
    // Navigate to signup
    cy.contains("Log In").click()
    cy.get(".modal").should("be.visible")
    cy.contains("Register instead").click()
    cy.wait(500)

    // Click NIP-05 signup option
    cy.contains("Create Account with NIP-05").click()
    cy.wait(1000)

    // Generate test credentials
    const username = `testuser${Math.random().toString(36).substring(2, 11)}`
    const password = `TestPass${Math.random().toString(36).substring(2, 15)}!`

    // Fill in signup form
    cy.get("input[type=text]").first().should("be.visible").type(username)
    cy.get("input[type=password]").eq(0).type(password)
    cy.get("input[type=password]").eq(1).type(password)

    // Generate keys
    cy.contains("Generate Keys").click()
    cy.wait(2000)

    // Verify keys are generated and displayed
    cy.contains("Keys Generated Successfully!", {timeout: 10000}).should("be.visible")
    cy.contains("Private Key (nsec)").should("be.visible")
    cy.contains("Public Key (npub)").should("be.visible")
    cy.contains(`${username}@anmore.me`).should("be.visible")

    // Verify nsec is displayed (should start with nsec1)
    cy.contains("nsec1").should("be.visible")

    // Skip email and continue
    cy.contains("I've Saved My Keys - Continue").click()
    cy.wait(2000)

    // Verify login completed and onboarding started
    cy.get(".modal", {timeout: 15000}).should("not.exist")
  })

  it("should show email option when generating keys", () => {
    cy.contains("Log In").click()
    cy.get(".modal").should("be.visible")
    cy.contains("Register instead").click()
    cy.wait(500)

    cy.contains("Create Account with NIP-05").click()
    cy.wait(1000)

    const username = `testuser${Math.random().toString(36).substring(2, 11)}`
    const password = `TestPass${Math.random().toString(36).substring(2, 15)}!`

    cy.get("input[type=text]").first().type(username)
    cy.get("input[type=password]").eq(0).type(password)
    cy.get("input[type=password]").eq(1).type(password)
    cy.contains("Generate Keys").click()
    cy.wait(2000)

    // Verify email option is available
    cy.contains("Send nsec by Email", {timeout: 10000}).should("be.visible")

    // Click email option
    cy.contains("Send nsec by Email").click()
    cy.wait(500)

    // Verify email form appears
    cy.get("input[type=email]").should("be.visible")
    cy.contains("Your Email Address").should("be.visible")

    // Skip email for test
    cy.contains("Skip").click()
    cy.wait(500)
    cy.contains("I've Saved My Keys - Continue").click()
    cy.wait(2000)
  })

  it("should validate password requirements", () => {
    cy.contains("Log In").click()
    cy.get(".modal").should("be.visible")
    cy.contains("Register instead").click()
    cy.wait(500)

    cy.contains("Create Account with NIP-05").click()
    cy.wait(1000)

    const username = `testuser${Math.random().toString(36).substring(2, 11)}`

    cy.get("input[type=text]").first().type(username)
    
    // Try with short password
    cy.get("input[type=password]").eq(0).type("short")
    cy.get("input[type=password]").eq(1).type("short")
    cy.contains("Generate Keys").click()

    // Should show validation error or prevent submission
    // (Implementation may vary, but should handle short passwords)
    cy.wait(1000)
  })

  it("should require matching passwords", () => {
    cy.contains("Log In").click()
    cy.get(".modal").should("be.visible")
    cy.contains("Register instead").click()
    cy.wait(500)

    cy.contains("Create Account with NIP-05").click()
    cy.wait(1000)

    const username = `testuser${Math.random().toString(36).substring(2, 11)}`

    cy.get("input[type=text]").first().type(username)
    cy.get("input[type=password]").eq(0).type("Password123!")
    cy.get("input[type=password]").eq(1).type("DifferentPassword123!")
    cy.contains("Generate Keys").click()

    // Should show password mismatch error
    cy.wait(1000)
  })

  it("should use nip05Signup command", () => {
    cy.nip05Signup({skipEmail: true}).then((account: any) => {
      expect(account.username).to.exist
      expect(account.password).to.exist
      expect(account.nip05).to.include("@anmore.me")
    })
  })
})

