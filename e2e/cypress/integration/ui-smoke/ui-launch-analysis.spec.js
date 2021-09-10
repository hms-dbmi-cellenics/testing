/// <reference types="cypress" />
import '../../support/commands';

const projectName = 'IntTest - Add Metadata Project';
const gem2sTimeOut = (60 * 1000) * 20; // 20 minutes;
const qcTimeOut = (60 * 1000) * 20; // 20 minutes;

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

  it('launches analysis', () => {
    // Wait for project to load
    cy.wait('@getProjects');

    cy.selectProject(projectName, false);

    cy.wait('@getExperiment');

    cy.randomizeSampleName(1);

    cy.launchAnalysis();

    cy.waitForGem2s(gem2sTimeOut);

    cy.waitForQc(qcTimeOut);
  });
});
