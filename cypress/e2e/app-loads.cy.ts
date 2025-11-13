describe('App loads', () => { it('should load homepage', () => { cy.visit('/'); cy.contains('Log In').should('be.visible'); }); });
