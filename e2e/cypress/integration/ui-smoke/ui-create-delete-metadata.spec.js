/// <reference types="cypress" />
import '../../support/commands';

const resizeObserverLoopErrRe = /ResizeObserver loop limit exceeded/;
const projectName = 'IntTest - Add Metadata Project';

describe('Adds metadata to a sample in a created project', () => {
  // before each test:
  //   1. set up the network intercepts
  //   2. Log in into biomage
  //   3. Visit data-management
  beforeEach(() => {
    // Intercept PUT calls to */project/* endpoint
    cy.intercept(
      {
        method: 'PUT',
        url: '*/projects/*',
      },
    ).as('updateProject');

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

  it('creates a new metadata track', () => {
    cy.selectProject(projectName, false);
    cy.addMetadata('testMetadataName');

    cy.wait('@updateProject');

    // Check that the current active project contains the metadata track
    cy.get('.ant-table-container').should((antTableContainer) => {
      expect(antTableContainer).to.contain('Track 1');
    });
  });

  it('deletes an existing metadata track', () => {
    cy.selectProject(projectName, false);
    cy.deleteMetadata('Track_1');

    cy.wait('@updateProject');

    // Check that the current active project contains the project title & description
    cy.get('.ant-table-container').should((antTableContainer) => {
      expect(antTableContainer).to.not.contain('Track 1');
    });
  });
});
