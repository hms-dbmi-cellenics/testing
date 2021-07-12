/// <reference types="cypress" />
import '../../support/commands';

describe('Redirects to login page when unauthenticated', () => {
  // beforeEach(() => {
  // });
  after(() => {
    cy.clearLocalStorageSnapshot();
    cy.clearLocalStorage();
  });

  afterEach(() => {
    cy.saveLocalStorage();
  });

  beforeEach(() => {
    cy.restoreLocalStorage();
  });

  it('redirects to a login page', () => {
    cy.visit('/data-management');
    console.log('CY URL IS ', cy.url());
    cy.url().should('include', 'auth.eu-west-1.amazoncognito.com');
  });

  it('Logging in', () => {
    cy.login();
    cy.visit('/data-management');
    cy.url().should('include', '/data-management');
  });
});
