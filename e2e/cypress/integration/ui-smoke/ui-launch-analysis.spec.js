/// <reference types="cypress" />
import '../../support/commands';

const resizeObserverLoopErrRe = /ResizeObserver loop limit exceeded/;
const gem2sStepTimeOut = (60 * 1000) * 5; // 5 minutes;

describe('Launches analysis successfully', () => {
  // before each test:
  //   1. set up the network intercepts
  //   2. Log in into biomage
  //   3. Visit data-management
  beforeEach(() => {
    // Intercept GET calls to */projects/* endpoint
    cy.intercept(
      {
        method: 'GET',
        url: '**/projects',
      },
    ).as('getProjects');

    // Intercept GET calls to */experiments/* endpoint
    cy.intercept(
      {
        method: 'GET',
        url: '**/experiments',
      },
    ).as('getExperiment');

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
    // Wait for project to load
    cy.wait('@getProjects').then(({ response }) => {
      const projects = response.body;

      const projectName = 'IntTest - Vicky Multisample Murine';

      // Get experiment id for the project
      const project = projects.find((p) => p.name === projectName);
      const experimentId = project.experiments[0];

      // Listen on websocket to get back GEM2S result
      cy.selectProject(projectName, false);

      cy.wait('@getExperiment');

      // We wait 2 seconds here to let the samples table rerender
      // This happens because call to backendStatus causes projectDetails to rerender
      // causing the element which Cypress had just selected to be no longer attached to the DOM
      // and Cypress could not act or observe the element anymore.
      // This call to wait may be revisited when we have refactored ProjectDetails
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(2000);

      cy.addMetadata();

      cy.launchAnalysis();

      cy.waitForGem2s(experimentId);

      // // Waiting for data-processing to show up
      // cy.contains('.data-test-page-header', 'Data Processing', { timeout: gem2sStepTimeOut }).should('exist');

      // cy.waitForQc(experimentId);

      // // Go back to Data Management to launch other analysis once GEM2S is done
      // cy.navigateTo('Data Management');

      // cy.deleteMetadata();
    });
  });
});
