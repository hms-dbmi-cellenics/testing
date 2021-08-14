/// <reference types="cypress" />
import '../../support/commands';

const resizeObserverLoopErrRe = /ResizeObserver loop limit exceeded/;

const waitForLaunch = 10000;
const gem2sTimeOut = (60 * 1000) * 30; // 30 minutes;

describe('Launches analysis successfully', () => {
  // before each test:
  //   1. set up the network intercepts
  //   2. Log in into biomage
  //   3. Visit data-management
  beforeEach(() => {
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

  it('launches analysis and skips gem2s on already ran sample', () => {
    cy.chooseProject();
    cy.launchAnalysis();

    // Check that GEM2S runs
    cy.get('.gem2s-status-result', { timeout: waitForLaunch }).should('not.exist');

    // Waiting for data-processing to show up
    cy.get('.data-processing-header', { timeout: gem2sTimeOut }).should('exist');
  });

  it('launches analysis and runs gem2s on new sample', () => {
    cy.createProject();
    cy.chooseProject();

    cy.chooseProject();
    cy.launchAnalysis();

    // Check that GEM2S runs
    cy.get('.gem2s-status-result', { timeout: 10000 }).should('exist');

    // Waiting for data-processing to show up
    cy.get('.data-processing-header', { timeout: gem2sTimeOut }).should('exist');
  });
});
