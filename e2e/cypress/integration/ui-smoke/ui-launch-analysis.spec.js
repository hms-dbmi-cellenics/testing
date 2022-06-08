/// <reference types="cypress" />
import '../../support/commands';

import { addFileActions } from '../../constants';

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

  Cypress.on('uncaught:exception', () => false);

  it(`creates a new project (${baseProjectName})`, () => {
    const alias = Cypress.env('E2E_ALIAS');
    let projectName = `${baseProjectName}`;
    if (alias) projectName += ` ${alias}`;

    // const projectName = baseProjectName;
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

    cy.log('Launching analysis.');
    cy.get('button:contains("Process project")').click();
    cy.get('button:contains("Yes")').click();
    cy.contains('We\'re launching your analysis...', { timeout: 60000 });

    // Disable email notification
    cy.get('button.ant-switch').click();
  });
});
