/// <reference types="cypress" />
import '../../support/commands';
import successResponse from '../../fixtures/successResponse.json';

const resizeObserverLoopErrRe = /ResizeObserver loop limit exceeded/;

describe('Adds metadata to a sample in a created project', () => {
  // before each test:
  //   1. set up the network intercepts
  //   2. Log in into biomage
  //   3. Visit data-management
  beforeEach(() => {
    // Intercept PUT/DELETE calls to */project/* endpoint
    cy.intercept(
      {
        method: 'PUT',
        url: '*/projects/*',
      },
    ).as('putProject');

    cy.intercept(
      {
        method: 'DELETE',
        url: '*/projects/*',
      },
    ).as('deleteProject');

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
    const projectName = 'IntTest - Add Metadata Project';
    const metadataKeysArray = ['Track_1'];

    cy.selectProject(projectName, { force: true });
    cy.addMetadata('testMetadataName');

    // check that req/response are correct
    cy.wait('@putProject').should(({ request, response }) => {
      expect(request.method).to.equal('PUT');
      expect(request.body).to.have.property('name', projectName);
      expect(request.body).to.have.property('metadataKeys');
      expect(request.body.metadataKeys).to.deep.equal(metadataKeysArray);
      expect(response.body).to.deep.equal(successResponse);
    });

    // Check that the current active project contains the project title & description
    cy.get('.ant-table-container').should((antTableContainer) => {
      expect(antTableContainer).to.contain('Track 1');
    });
  });

  it('deletes an existing metadata track', () => {
    const projectName = 'IntTest - Add Metadata Project';
    const emptyMetadataKeysArray = [];

    cy.selectProject(projectName, { force: true });
    cy.deleteMetadata('Track_1');

    // check that req/response are correct
    cy.wait('@putProject').should(({ request, response }) => {
      expect(request.method).to.equal('PUT');
      expect(request.body).to.have.property('name', projectName);
      expect(request.body).to.have.property('metadataKeys');
      expect(request.body.metadataKeys).to.deep.equal(emptyMetadataKeysArray);
      expect(response.body).to.deep.equal(successResponse);
    });

    // Check that the current active project contains the project title & description
    cy.get('.ant-table-container').should((antTableContainer) => {
      expect(antTableContainer).to.not.contain('Track 1');
    });
  });
});
