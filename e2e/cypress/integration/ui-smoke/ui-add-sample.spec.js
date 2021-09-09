/// <reference types="cypress" />
import '../../support/commands';
// import successResponse from '../../fixtures/successResponse.json';

import { addFileActions } from '../../constants';

const resizeObserverLoopErrRe = /ResizeObserver loop limit exceeded/;

describe('Sample addition/removal', () => {
  // before each test:
  //   1. set up the network intercepts
  //   2. Log in into biomage
  //   3. Visit data-management
  beforeEach(() => {
    // cy.intercept(
    //   {
    //     method: 'PUT',
    //     url: '*/projects/*',
    //   },
    // ).as('putProject');

    // cy.intercept(
    //   {
    //     method: 'PUT',
    //     url: '**/samples',
    //   },
    // ).as('updateSamples');

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

  // it('Adds a new sample by folder selection', () => {
  //   const projectName = 'IntTest - Add sample Project';

  //   cy.selectProject(projectName);

  //   cy.addSample(addFileActions.SELECT_FOLDER);
  // });

  it('Adds a new sample by folder selection', () => {
    const projectName = 'IntTest - Add sample Project';

    cy.selectProject(projectName);

    cy.addSample(addFileActions.SELECT_INPUT);
  });
});
