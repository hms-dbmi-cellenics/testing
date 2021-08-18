/// <reference types="cypress" />
import '../../support/commands';

const resizeObserverLoopErrRe = /ResizeObserver loop limit exceeded/;

const gem2sTimeOut = (60 * 1000) * 30; // 30 minutes;

describe('Launches analysis successfully', () => {
  // before each test:
  //   1. set up the network intercepts
  //   2. Log in into biomage
  //   3. Visit data-management
  beforeEach(() => {
    // Intercept GET calls to */backendStatus/* endpoint
    cy.intercept(
      {
        method: 'GET',
        url: '*backendStatus*',
      },
    ).as('getBackendStatus');

    cy.login();
    cy.visit('/data-management');
  });

  // we have some kind of resize observer loop error that needs looking into
  Cypress.on('uncaught:exception', (err) => {
    if (resizeObserverLoopErrRe.test(err.message)) {
      return false;
    }
    return true;
  });

  it('launches analysis', () => {
    cy.chooseProject();

    cy.wait('@getBackendStatus');
    cy.launchAnalysis();

    // Waiting for data-processing to show up
    cy.contains('div > span', 'Data Processing', { timeout: gem2sTimeOut }).should('exist');
  });
});
