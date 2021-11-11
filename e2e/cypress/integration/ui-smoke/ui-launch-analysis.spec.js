/// <reference types="cypress" />
import '../../support/commands';

const resizeObserverLoopErrRe = /ResizeObserver loop limit exceeded/;
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

  // we have some kind of resize observer loop error that needs looking into
  Cypress.on('uncaught:exception', (err) => {
    if (resizeObserverLoopErrRe.test(err.message)) {
      return false;
    }
    return true;
  });

  it('loads projects', () => {
    cy.wait('@getProjects');
  });

  it('selects projects', () => {
    cy.selectProject(projectName, false);
    cy.wait('@getExperiment');
  });

  it('makes changes to project', () => {
    cy.randomizeSampleName(1);
  });

  it('launches analysis', () => {
    cy.launchAnalysis();
  });

  it('completes gem2s and pipeline successfully', () => {
    cy.waitForGem2s(gem2sTimeOut);
    cy.waitForQc(qcTimeOut);
  });
});
