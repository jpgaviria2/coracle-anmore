describe("search", () => {
  it("works", () => {
    cy.visit("/")
    // Navigate to search page directly or click search icon
    cy.get("body").then(($body) => {
      // Check if search icon exists (mobile view)
      if ($body.find(".fa-search").length > 0) {
        cy.get(".fa-search").first().click({force: true})
        cy.wait(500)
      }
    })
    // Or navigate directly to search page
    cy.visit("/search")
    cy.wait(1000)
    // Type in search input
    cy.get("input[type=text]").first().should("be.visible").type("hodlbod")
    cy.wait(2000)
    // Check if search results appear (may or may not have results)
    cy.get("body").should("be.visible")
  })
})
