/// <reference types="cypress" />
import '../../support/commands';

import { addFileActions } from '../../constants';

const gem2sTimeOut = (60 * 1000) * 20; // 20 minutes
const qcTimeOut = (60 * 1000) * 20; // 20 minutes
const explorationTimeout = (60 * 1000) * 3; // 3 minutes

const baseProjectName = 'GSE183716 - Covid19';
const projectDescription = '';

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
  //   cy.visit('/data-management');
  //   cy.selectProject(projectName, false);
  //   cy.cleanUpProjectIfNecessary(projectName);
  // });

  Cypress.on('uncaught:exception', () => false);

  it(`creates a new project (${baseProjectName})`, () => {
    // cy.cleanUpProjectIfNecessary(projectName);
    // cy.deleteProject(projectName);
    // const alias = Cypress.env('E2E_ALIAS');
    // const projectName = `${baseProjectName} ${alias}`;
    const projectName = baseProjectName;
    cy.createProject(projectName, projectDescription);

    cy.log('Check that current active project is correct.');
    cy.get('#project-details').should(($p) => {
      expect($p).to.contain(projectName);
      expect($p).to.contain(projectDescription);
    });

    cy.log('Check that project list contains our project.');
    cy.get('[data-test-class=data-test-project-card]', { timeout: 100000 }).should(($p) => {
      expect($p).to.contain(projectName);
    });

    cy.selectProject(projectName, false);
    cy.addSample('P13 Convalescent MISC', addFileActions.SELECT_INPUT);
    cy.addSample('P13 Acute MISC', addFileActions.SELECT_INPUT);
    cy.addSample('P14 Acute MISC', addFileActions.SELECT_INPUT);

    // Sample cell shows up
    cy.contains('.data-test-sample-in-table-name', 'P13 Convalescent MISC', { timeout: 10000 }).should('exist');
    cy.contains('.data-test-sample-in-table-name', 'P13 Acute MISC', { timeout: 10000 }).should('exist');
    cy.contains('.data-test-sample-in-table-name', 'P14 Acute MISC', { timeout: 10000 }).should('exist');

    cy.log('Wait until all files are loaded.');
    const uploadTimeout = 60 * 1000;
    cy.get('[data-test-id="process-project-button"]', { timeout: uploadTimeout }).should('be.enabled');
    // });

    // it('adds and randomizes metadata', () => {
    //   cy.selectProject(projectName, false);
    //   cy.addMetadata('testMetadataName');

    //   cy.log('Check that the current active project contains the metadata track.');
    //   cy.get('.ant-table-container').should((antTableContainer) => {
    //     expect(antTableContainer).to.contain('Track 1');
    //   });
    //   cy.changeMetadataNames(0);
    // });

    // it('Can pre-process project from scratch', () => {
    // cy.selectProject(projectName, false);
    // cy.randomizeSampleName(1);

    cy.log('Launching analysis.');
    cy.get('button:contains("Process project")').click();
    cy.get('button:contains("Yes")').click();
    // cy.get('button:contains("Yes")').click().then(() => {
    //   cy.url().then((url) => {
    //     cy.log(url);
    //   });
    // });
    cy.contains('We\'re launching your analysis...', { timeout: 60000 });
    // cy.contains('We\'re launching your analysis...', { timeout: 60000 }).then(() => {
    //   cy.url().then((url) => {
    //     cy.log(url);
    //   });
    // }); // wait for 1 minute
    // cy.url().then((url) => {
    //   cy.log(url);
    // });
    // cy.waitForGem2s(gem2sTimeOut);
    // cy.waitForQc(qcTimeOut);
    // // });

    // // it('Can explore processed data', () => {
    // cy.selectProject(projectName, false);

    // cy.log('Moving to Data Processing.');
    // cy.get('button:contains("Go to Data Processing")').click();

    // cy.log('Data Processing page should load.');
    // cy.contains('.data-test-page-header', 'Data Processing', { timeout: 60 * 1000 }).should('exist');

    // cy.log('Moving to Data Exploration.');
    // cy.get('.ant-menu-item:contains("Data Exploration")').click();

    // cy.log('Data Exploration page should load.');
    // cy.contains('.data-test-page-header', 'Data Exploration', { timeout: 60 * 1000 }).should('exist');

    // cy.contains(/(We're getting your data|This will take a few minutes)/).should('exist');
    // cy.contains(/(We're getting your data|This will take a few minutes)/, { timeout: explorationTimeout }).should('not.exist');
    // cy.get('button:contains("Try again")').should('not.exist');
  });
});
