/// <reference types="cypress" />
import '../../support/commands';
import { addFileActions } from '../../constants';

const gem2sTimeOut = (60 * 1000) * 20; // 20 minutes
const qcTimeOut = (60 * 1000) * 20; // 20 minutes
const explorationTimeout = (60 * 1000) * 3; // 3 minutes

const projectName = `Integration test ${+new Date()}`;
const projectDescription = 'Tissue sample from varelse species known as pequeninos.';

describe('Launches analysis successfully', () => {
  beforeEach(() => {
    Cypress.config('defaultCommandTimeout', 10000);
    cy.login();
    cy.visit('/data-management');
  });

  after(() => {
    cy.visit('/data-management');
    cy.selectProject(projectName, false);
    cy.cleanUpProjectIfNecessary(projectName);
  });

  Cypress.on('uncaught:exception', () => false);

  it(`creates a new project (${projectName})`, () => {
    cy.createProject(projectName, projectDescription);

    cy.log('Check that current active project is correct.');
    cy.get('#project-details').should(($p) => {
      expect($p).to.contain(projectName);
      expect($p).to.contain(projectDescription);
    });

    cy.log('Check that project list contains our project.');
    cy.get('[data-test-class=data-test-project-card]', { timeout: 10000 }).should(($p) => {
      expect($p).to.contain(projectName);
    });
  });

  it('adds sample', () => {
    cy.selectProject(projectName, false);
    cy.addSample('WT1', addFileActions.DRAG_AND_DROP);

    cy.log('Wait until sample shows up.');
    cy.contains('.data-test-sample-in-table-name', 'WT1', { timeout: 10000 }).should('exist');

    cy.addSample('pbmc1kfiltered', addFileActions.DRAG_AND_DROP);

    cy.log('Wait until sample shows up.');
    cy.contains('.data-test-sample-in-table-name', 'pbmc1kfiltered', { timeout: 10000 }).should('exist');

    cy.log('Wait until all files are loaded.');
    const uploadTimeout = 60 * 1000;
    cy.get('[data-test-id="process-project-button"]', { timeout: uploadTimeout }).should('be.enabled');
  });

  it('adds and randomizes metadata', () => {
    cy.selectProject(projectName, false);
    cy.addMetadata('testMetadataName');

    cy.log('Check that the current active project contains the metadata track.');
    cy.get('.ant-table-container').should((antTableContainer) => {
      expect(antTableContainer).to.contain('Track 1');
    });
    cy.changeMetadataNames(0);
  });

  it('Can pre-process project from scratch', () => {
    cy.selectProject(projectName, false);
    cy.randomizeSampleName(1);

    cy.log('Launching analysis.');
    cy.get('button:contains("Process project")').click();
    cy.get('button:contains("Yes")').click();

    cy.waitForGem2s(gem2sTimeOut);
    cy.waitForQc(qcTimeOut);
  });

  it('Can explore processed data', () => {
    cy.selectProject(projectName, false);

    cy.log('Moving to Data Processing.');
    cy.get('button:contains("Go to Data Processing")').click();

    cy.log('Data Processing page should load.');
    cy.contains('.data-test-page-header', 'Data Processing', { timeout: 60 * 1000 }).should('exist');

    cy.log('Moving to Data Exploration.');
    cy.get('.ant-menu-item:contains("Data Exploration")').click();

    cy.log('Data Exploration page should load.');
    cy.contains('.data-test-page-header', 'Data Exploration', { timeout: 60 * 1000 }).should('exist');

    cy.contains(/(We're getting your data|This will take a few minutes)/).should('exist');
    cy.contains(/(We're getting your data|This will take a few minutes)/, { timeout: explorationTimeout }).should('not.exist');
    cy.get('button:contains("Try again")').should('not.exist');
  });
});
