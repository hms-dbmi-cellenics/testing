/// <reference types="cypress" />
import '../../support/commands';

describe('Redirects to login page when unauthenticated', () => {
  before(() => {
    cy.clearLocalStorageSnapshot();
  });

  beforeEach(() => {
    cy.restoreLocalStorage();
  });

  afterEach(() => {
    cy.saveLocalStorage();
  });

  it('redirects to a login page', () => {
    cy.visit('/data-management');
    cy.url().should('include', 'auth.eu-west-1.amazoncognito.com');
  });

  it('Logging in', () => {
    cy.visit('/not_valid_url', { failOnStatusCode: false });
    cy.login();
    cy.visit('/data-management');
  });
});
