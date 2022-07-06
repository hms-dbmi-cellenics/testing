/// <reference types="cypress" />
import '../../support/commands';

describe('Launches analysis successfully', () => {
  beforeEach(() => {
    Cypress.config('defaultCommandTimeout', 10000);
    cy.login();
    cy.visit('/data-management');
  });

  after(() => {
    cy.url().then((url) => {
      cy.log(url);
    });
    cy.log(cy.url());
    cy.url();
  });

  Cypress.on('uncaught:exception', () => false);

  it('Adds workshop dataset', () => {
    // Clone the new sample dataset
    cy.get('button:contains("Workshop dataset")').click();

    // Sample cell shows up
    cy.contains('.data-test-sample-in-table-name', 'P13 Convalescent MISC', { timeout: 10000 }).should('exist');
    cy.contains('.data-test-sample-in-table-name', 'P13 Acute MISC', { timeout: 10000 }).should('exist');
    cy.contains('.data-test-sample-in-table-name', 'P14 Acute MISC', { timeout: 10000 }).should('exist');

    cy.log('Wait until all files are loaded.');
    const uploadTimeout = 60 * 1000;
    cy.get('[data-test-id="process-project-button"]', { timeout: uploadTimeout }).should('be.enabled');

    cy.log('Launching analysis.');
    cy.get('button:contains("Process project")').click();
    cy.get('button:contains("Yes")').click();
    cy.contains('We\'re launching your analysis...', { timeout: 60000 });

    // Disable email notification
    cy.get('button.ant-switch').click();
  });
});
