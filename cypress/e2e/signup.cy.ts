describe("signup", () => {
  beforeEach(() => {
    cy.visit("/")
  })

  it("should complete NIP-05 signup flow", () => {
    cy.get(".cy-top-nav").contains("Log In").click()
    cy.get(".modal").should("be.visible")
    cy.contains("Register instead").click()
    cy.wait(500)

    // Use NIP-05 signup
    cy.contains("Create Account with NIP-05").click()
    cy.wait(1000)

    const username = `testuser${Math.random().toString(36).substring(2, 11)}`
    const password = `TestPass${Math.random().toString(36).substring(2, 15)}!`

    cy.get("input[type=text]").first().type(username)
    cy.get("input[type=password]").eq(0).type(password)
    cy.get("input[type=password]").eq(1).type(password)
    cy.contains("Generate Keys").click()
    cy.wait(2000)

    cy.contains("Keys Generated Successfully!", {timeout: 10000}).should("be.visible")
    cy.contains("I've Saved My Keys - Continue").click()
    cy.wait(2000)

    cy.get(".modal", {timeout: 15000}).should("not.exist")
    cy.contains("Don't have an account?").should("not.exist")
  })

  it("should still support njump/nstart fallback option", () => {
    cy.get(".cy-top-nav").contains("Log In").click()
    cy.get(".modal").should("be.visible")
    cy.contains("Register instead").click()
    cy.wait(500)

    // Verify njump option is still available
    cy.contains("Use nstart").should("be.visible")
  })
})
