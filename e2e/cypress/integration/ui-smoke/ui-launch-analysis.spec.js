/// <reference types="cypress" />
import '../../support/commands';

const resizeObserverLoopErrRe = /ResizeObserver loop limit exceeded/;

const numGem2sSteps = 6;
const gem2sStepTimeOut = (60 * 1000) * 5; // 30 minutes;
const qcTimeOut = (60 * 1000) * 30; // 30 minutes;

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
    cy.wait('@getProjects').then(({ response }) => {
      const projects = response.body;

      projects.forEach((project) => {
        cy.selectProject(project.name);

        cy.wait('@getExperiment');

        cy.launchAnalysis();

        // Listen on websocket to get back GEM2S result
        cy.listenOnWebsocket((socket) => {
          const gem2sResults = [];
          const experimentId = project.experiments[0];

          socket.on(`ExperimentUpdates-${experimentId}`, (update) => {
            gem2sResults.push(update);
          });

          for (let i = 0; i < numGem2sSteps; i += 1) {
            // Step 1
            cy.waitUntil(() => gem2sResults[i]?.type === 'gem2s',
              {
                timeout: gem2sStepTimeOut,
                interval: 2000,
              });

            cy.log(`GEM2S step ${i + 1} completed`);
          }
        });

        // Waiting for data-processing to show up
        cy.contains('div > span', 'Data Processing', { timeout: gem2sStepTimeOut }).should('exist');

        // Wait for QC to finish and then go back to Data Management to launch other analysis
        cy.navigateTo('Data Management', { timeout: qcTimeOut });
      });
    });
  });
});
