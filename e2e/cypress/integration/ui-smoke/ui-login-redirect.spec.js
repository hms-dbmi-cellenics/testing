/// <reference types="cypress" />

describe('Redirects to login page when unauthenticated', () => {
  beforeEach(() => {
    cy.visit('/data-management');
  });

  it('redirects to a login page', () => {
    cy.url().should('include', 'auth.eu-west-1.amazoncognito.com');
  });
});
