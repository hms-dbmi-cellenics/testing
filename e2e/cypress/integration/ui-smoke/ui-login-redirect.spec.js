/// <reference types="cypress" />

describe('Redirects to login page when unauthenticated', () => {
  beforeEach(() => {
    cy.visit('/data-management');
  });

  it('redirects to the appropriate login page', () => {
    cy.url().should('include', 'biomage.auth.eu-west-1.amazoncognito.com');
  });
});
