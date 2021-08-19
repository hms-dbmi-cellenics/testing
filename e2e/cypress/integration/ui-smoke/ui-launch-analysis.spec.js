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
    cy.wait('@getProjects').then((el) => {
      const { response } = el;
      const projectNames = response.body.map((project) => project.name);

      projectNames.forEach((projectName) => {
        cy.selectProject(projectName);

        cy.wait('@getExperiment');

        cy.launchAnalysis();

        // Waiting for data-processing to show up
        cy.contains('div > span', 'Data Processing', { timeout: gem2sTimeOut }).should('exist');

        // Go back to Data Management to launch other analyses
        cy.navigateTo('Data Management');
      });
    });
  });
});
