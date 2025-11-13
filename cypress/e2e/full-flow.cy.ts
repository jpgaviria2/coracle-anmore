describe("Full Flow: Signup → Login → Post → Admin", () => {
  let testAccount: {username: string; password: string; nip05: string}
  const adminNsec = Cypress.env("ADMIN_NSEC") || "nsec1er8narhat3xjypf46pksxlr6k4jrmv2e9psazjk0adynly0l4ltsepvmy5"

  it("should complete full user journey", () => {
    // Step 1: NIP-05 Signup
    cy.visit("/")
    cy.contains("Log In").click()
    cy.get(".modal").should("be.visible")
    cy.contains("Register instead").click()
    cy.wait(500)

    cy.contains("Create Account with NIP-05").click()
    cy.wait(1000)

    const username = `fullflow${Math.random().toString(36).substring(2, 11)}`
    const password = `FullFlowPass${Math.random().toString(36).substring(2, 15)}!`

    cy.get("input[type=text]").first().type(username)
    cy.get("input[type=password]").eq(0).type(password)
    cy.get("input[type=password]").eq(1).type(password)
    cy.contains("Generate Keys").click()
    cy.wait(2000)

    cy.contains("Keys Generated Successfully!", {timeout: 10000}).should("be.visible")
    cy.contains("I've Saved My Keys - Continue").click()
    cy.wait(2000)

    testAccount = {username, password, nip05: `${username}@anmore.me`}

    // Step 2: Complete onboarding (skip for now)
    cy.get(".modal", {timeout: 15000}).should("not.exist")

    // Step 3: Create a post
    cy.visit("/notes/create")
    cy.wait(1000)

    const postContent = `Full flow test post ${Math.random().toString(36).substring(2, 9)} #anmore #test`
    cy.get(".ProseMirror", {timeout: 10000}).type(postContent)
    cy.contains("Publish").click()
    cy.wait(2000)
    cy.get(".modal", {timeout: 15000}).should("not.exist")

    // Step 4: Verify post in feed
    cy.visit("/notes")
    cy.wait(2000)
    cy.contains(postContent, {timeout: 10000}).should("be.visible")

    // Step 5: Logout and login again
    cy.visit("/logout")
    cy.wait(1000)

    // Step 6: Login with saved credentials
    cy.contains("Log In").click()
    cy.get(".modal").should("be.visible")
    cy.contains("Log In with NIP-05").click()
    cy.wait(500)

    cy.get("input[type=text]").type(testAccount.nip05)
    cy.get("input[type=password]").type(testAccount.password)
    cy.contains("Log In").click()
    cy.wait(2000)
    cy.get(".modal", {timeout: 15000}).should("not.exist")

    // Step 7: Verify logged in
    cy.contains("Don't have an account?").should("not.exist")
  })

  it("should test admin flow if admin nsec is configured", () => {
    if (!adminNsec || adminNsec === "nsec1er8narhat3xjypf46pksxlr6k4jrmv2e9psazjk0adynly0l4ltsepvmy5") {
      cy.log("Admin nsec not configured, skipping admin flow test")
      return
    }

    // Admin login
    cy.adminLogin(adminNsec)

    // Access admin dashboard
    cy.visit("/admin")
    cy.contains("Admin Dashboard", {timeout: 10000}).should("be.visible")

    // Manage hashtags
    cy.contains("Manage Hashtags").click()
    cy.wait(1000)

    // Add a test hashtag
    const testHashtag = `admintest${Math.random().toString(36).substring(2, 9)}`
    cy.get("input[type=text]").type(testHashtag)
    cy.contains("Add").click()
    cy.wait(2000)

    // Verify hashtag was added
    cy.contains(testHashtag, {timeout: 10000}).should("be.visible")

    // Remove the hashtag
    cy.contains(testHashtag).parent().find("button").click()
    cy.wait(2000)
    cy.contains(testHashtag).should("not.exist")
  })

  it("should test complete flow with commands", () => {
    // Use custom commands for cleaner test
    cy.nip05Signup({skipEmail: true}).then((account: any) => {
      cy.nip05Login(account.nip05, account.password)
      cy.createPost("Test post from full flow #anmore")
      cy.visit("/notes")
      cy.wait(2000)
      cy.contains("Test post from full flow", {timeout: 10000}).should("be.visible")
    })
  })
})

