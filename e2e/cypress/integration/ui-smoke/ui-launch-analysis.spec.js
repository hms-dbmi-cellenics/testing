/// <reference types="cypress" />
import '../../support/commands';

const projectName = 'IntTest - Add Metadata Project';
const gem2sTimeOut = (60 * 1000) * 20; // 20 minutes
const qcTimeOut = (60 * 1000) * 20; // 20 minutes
const explorationTimeout = (60 * 1000) * 3; // 3 minutes

describe('Launches analysis successfully', () => {
  beforeEach(() => {
    Cypress.config('defaultCommandTimeout', 10000);
    cy.login();
    cy.visit('/data-management');
  });

  Cypress.on('uncaught:exception', () => false);

  it('Can pre-process project from scratch', () => {
    cy.selectProject(projectName);
    cy.randomizeSampleName(1);

    cy.log('Launching analysis.');
    cy.get('button:contains("Process project")').click();
    cy.get('button:contains("Yes")').click();

    cy.waitForGem2s(gem2sTimeOut);
    cy.waitForQc(qcTimeOut);
  });

  it('Can explore processed data', () => {
    cy.selectProject(projectName);

    cy.log('Moving to Data Processing.');
    cy.get('button:contains("Go to Data Processing")').click();

    cy.log('Data Processing page should load.');
    cy.contains('.data-test-page-header', 'Data Processing').should('exist');

    cy.log('Moving to Data Exploration.');
    cy.get('.ant-menu-item:contains("Data Exploration")').click();

    cy.log('Data Exploration page should load.');
    cy.contains('.data-test-page-header', 'Data Exploration').should('exist');

    cy.contains(/(We're getting your data|This will take a few minutes)/).should('exist');
    cy.contains(/(We're getting your data|This will take a few minutes)/, { timeout: explorationTimeout }).should('not.exist');
    cy.get('button:contains("Try again")').should('not.exist');
  });
});
