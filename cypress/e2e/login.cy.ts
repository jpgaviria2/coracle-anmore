describe("authenticated usage", () => {
  beforeEach(() => {
    cy.login()
  })

  it("should work with legacy login", () => {
    cy.visit("/")
    cy.get("svg.logo").click()
    cy.get(".card").contains("Profile").click()
    cy.get(".cy-person-name").contains("test account 12938740")
  })

  it("should support NIP-05 login", () => {
    // Create account and login with NIP-05
    cy.nip05Signup({skipEmail: true}).then((account: any) => {
      cy.visit("/logout")
      cy.wait(1000)

      cy.nip05Login(account.nip05, account.password)
      cy.visit("/")
      cy.contains("Don't have an account?").should("not.exist")
    })
  })
})
