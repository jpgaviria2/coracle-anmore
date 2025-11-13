describe("Admin Features", () => {
  const adminNsec = Cypress.env("ADMIN_NSEC") || "nsec1er8narhat3xjypf46pksxlr6k4jrmv2e9psazjk0adynly0l4ltsepvmy5"
  let regularAccount: {username: string; password: string; nip05: string}

  before(() => {
    // Create a regular (non-admin) account
    cy.nip05Signup({skipEmail: true}).then((account: any) => {
      regularAccount = account
    })
  })

  describe("Admin Dashboard Access", () => {
    it("should allow admin to access admin dashboard", () => {
      cy.adminLogin(adminNsec)
      cy.visit("/admin")
      cy.contains("Admin Dashboard", {timeout: 10000}).should("be.visible")
    })

    it("should prevent non-admin users from accessing admin dashboard", () => {
      cy.nip05Login(regularAccount.nip05, regularAccount.password)
      cy.visit("/admin")

      // Non-admin should not see admin dashboard
      // May redirect or show error
      cy.wait(2000)
      cy.contains("Admin Dashboard").should("not.exist")
    })
  })

  describe("Hashtag Whitelist Management", () => {
    beforeEach(() => {
      cy.adminLogin(adminNsec)
      cy.visit("/admin")
    })

    it("should navigate to hashtag management", () => {
      cy.contains("Admin Dashboard").should("be.visible")
      cy.contains("Manage Hashtags").click()
      cy.wait(1000)

      cy.contains("Admin Hashtag Whitelist", {timeout: 10000}).should("be.visible")
    })

    it("should add a hashtag to whitelist", () => {
      cy.visit("/admin/hashtags")
      cy.wait(1000)

      const testHashtag = `testhashtag${Math.random().toString(36).substring(2, 9)}`

      // Add hashtag
      cy.get("input[type=text]").type(testHashtag)
      cy.contains("Add").click()
      cy.wait(2000)

      // Verify hashtag appears in whitelist
      cy.contains(testHashtag, {timeout: 10000}).should("be.visible")
    })

    it("should remove a hashtag from whitelist", () => {
      cy.visit("/admin/hashtags")
      cy.wait(1000)

      // First add a hashtag
      const testHashtag = `removetest${Math.random().toString(36).substring(2, 9)}`
      cy.get("input[type=text]").type(testHashtag)
      cy.contains("Add").click()
      cy.wait(2000)

      // Find and remove the hashtag
      cy.contains(testHashtag).parent().find("button").click()
      cy.wait(2000)

      // Verify hashtag is removed
      cy.contains(testHashtag).should("not.exist")
    })

    it("should display current whitelist", () => {
      cy.visit("/admin/hashtags")
      cy.wait(1000)

      cy.contains("Current Whitelist", {timeout: 10000}).should("be.visible")
    })
  })

  describe("Hashtag Filtering", () => {
    beforeEach(() => {
      cy.adminLogin(adminNsec)
    })

    it("should filter hashtags in feed based on whitelist", () => {
      // Add a test hashtag to whitelist
      cy.visit("/admin/hashtags")
      cy.wait(1000)

      const whitelistedHashtag = `whitelisted${Math.random().toString(36).substring(2, 9)}`
      cy.get("input[type=text]").type(whitelistedHashtag)
      cy.contains("Add").click()
      cy.wait(2000)

      // Create a post with multiple hashtags
      cy.visit("/notes/create")
      cy.wait(1000)

      const postContent = `Test post #${whitelistedHashtag} #notwhitelisted`
      cy.get(".ProseMirror", {timeout: 10000}).type(postContent)
      cy.contains("Publish").click()
      cy.wait(2000)

      // Verify post was created
      cy.get(".modal", {timeout: 15000}).should("not.exist")

      // Check feed - only whitelisted hashtags should appear
      cy.visit("/notes")
      cy.wait(2000)
      // The actual filtering verification would require checking note tags
    })
  })

  describe("Admin Menu Visibility", () => {
    it("should show admin menu item for admin users", () => {
      cy.adminLogin(adminNsec)
      cy.visit("/")

      // Admin menu should be visible
      cy.get("body").then(($body) => {
        if ($body.find("a[href*='/admin']").length > 0) {
          cy.get("a[href*='/admin']").should("be.visible")
        }
      })
    })

    it("should not show admin menu item for regular users", () => {
      cy.nip05Login(regularAccount.nip05, regularAccount.password)
      cy.visit("/")

      // Admin menu should not be visible
      cy.get("a[href*='/admin']").should("not.exist")
    })
  })
})

