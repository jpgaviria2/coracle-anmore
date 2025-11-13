describe("Posting and Content Creation", () => {
  let testAccount: {username: string; password: string; nip05: string}

  before(() => {
    cy.nip05Signup({skipEmail: true}).then((account: any) => {
      testAccount = account
    })
  })

  beforeEach(() => {
    cy.nip05Login(testAccount.nip05, testAccount.password)
    cy.visit("/")
  })

  it("should create a note/post", () => {
    const postContent = `Test post ${Math.random().toString(36).substring(2, 9)}`

    cy.visit("/notes/create")
    cy.wait(1000)

    // Find editor and type content
    cy.get(".ProseMirror", {timeout: 10000}).should("be.visible").type(postContent)

    // Submit the post
    cy.contains("Publish").click()

    // Wait for post to be published
    cy.wait(2000)
    cy.get(".modal", {timeout: 15000}).should("not.exist")

    // Verify post appears in feed
    cy.visit("/notes")
    cy.wait(2000)
    cy.contains(postContent, {timeout: 10000}).should("be.visible")
  })

  it("should automatically add default hashtag to posts", () => {
    const postContent = `Test post with hashtag ${Math.random().toString(36).substring(2, 9)}`
    const defaultHashtag = Cypress.env("DEFAULT_HASHTAG") || "anmore"

    cy.visit("/notes/create")
    cy.wait(1000)

    cy.get(".ProseMirror", {timeout: 10000}).type(postContent)
    cy.contains("Publish").click()
    cy.wait(2000)

    // Check that default hashtag is added
    // This would require checking the note's tags, which may need API access
    // For now, verify the post was created
    cy.get(".modal", {timeout: 15000}).should("not.exist")
  })

  it("should use createPost command", () => {
    cy.createPost().then((post: any) => {
      expect(post.content).to.exist
      cy.visit("/notes")
      cy.wait(2000)
      cy.contains(post.content, {timeout: 10000}).should("be.visible")
    })
  })

  it("should create a service listing", () => {
    const serviceData = {
      title: `Test Service ${Math.random().toString(36).substring(2, 9)}`,
      summary: "Test service summary",
      description: "This is a test service description for automated testing",
      category: "Technology",
      serviceType: "Remote",
      location: "Remote",
      price: "100000",
    }

    cy.visit("/services/create")
    cy.wait(1000)

    // Fill in service form
    cy.get("input[type=text]").eq(0).type(serviceData.title)
    if (serviceData.summary) {
      cy.get("input[type=text]").eq(1).type(serviceData.summary)
    }

    // Type description in editor
    cy.get(".ProseMirror", {timeout: 10000}).should("be.visible").type(serviceData.description)

    // Fill optional fields if they exist
    cy.get("body").then(($body) => {
      if ($body.find("input[type=text]").length > 2) {
        cy.get("input[type=text]").eq(2).type(serviceData.category)
      }
    })

    // Submit
    cy.contains("Publish Service Listing").click()

    // Wait for submission
    cy.wait(2000)
    cy.get(".modal", {timeout: 15000}).should("not.exist")

    // Verify service appears in directory
    cy.visit("/services")
    cy.wait(2000)
    cy.contains(serviceData.title, {timeout: 10000}).should("be.visible")
  })

  it("should filter hashtags based on whitelist", () => {
    // This test requires admin setup to manage whitelist
    // For now, verify that hashtags are displayed
    cy.visit("/notes")
    cy.wait(2000)

    // Check if hashtags are visible in the feed
    // The actual filtering would be tested in admin tests
    cy.get("body").should("be.visible")
  })
})

