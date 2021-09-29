/// <reference types="cypress" />
import '../../support/commands';

import { addFileActions } from '../../constants';

const resizeObserverLoopErrRe = /ResizeObserver loop limit exceeded/;
const projectName = 'IntTest - Add sample Project';

describe('Sample addition/removal', () => {
  // before each test:
  //   1. set up the network intercepts
  //   2. Log in into biomage
  //   3. Visit data-management

  beforeEach(() => {
    cy.login();
    cy.visit('/data-management');
  });

  const cleanup = () => {
    cy.deleteProject(projectName);
  };

  // we have some kind of resize observer loop error that needs looking into
  Cypress.on('uncaught:exception', (err) => {
    if (resizeObserverLoopErrRe.test(err.message)) {
      return false;
    }
    return true;
  });

  it('Adds a new sample correctly by drag and drop', () => {
    cy.createProject(projectName);

    cy.addSample(addFileActions.DRAG_AND_DROP);

    // Sample cell shows up
    cy.contains('.data-test-sample-in-table-name', 'WT1', { timeout: 10000 }).should('be.visible');

    // Wait until all files are loaded
    const uploadTimeout = 60 * 1000; // 1 minute;
    cy.get('[data-test-id="launch-analysis-button"]', { timeout: uploadTimeout }).should('be.enabled');
    cy.removeSample();

    // Sample cell no longer shows up
    cy.contains('.data-test-sample-in-table-name', 'WT1').should('not.exist');
  });

  // Workaround so we perform the cleanup that afterEach should have. See: https://github.com/cypress-io/cypress/issues/2831.
  it('afterEach', cleanup);

  it('Adds a new sample correctly by input selection', () => {
    cy.createProject(projectName);

    cy.addSample(addFileActions.SELECT_INPUT);

    // Sample cell shows up
    cy.contains('.data-test-sample-in-table-name', 'WT1', { timeout: 10000 }).should('be.visible');

    // Wait until all files are loaded
    const uploadTimeout = 60 * 1000; // 1 minute;
    cy.get('[data-test-id="launch-analysis-button"]', { timeout: uploadTimeout }).should('be.enabled');
    cy.removeSample();

    // Sample cell no longer shows up
    cy.contains('.data-test-sample-in-table-name', 'WT1').should('not.exist');
  });

  // Workaround so we perform the cleanup that afterEach should have. See: https://github.com/cypress-io/cypress/issues/2831.
  it('afterEach', cleanup);
});
