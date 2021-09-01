/// <reference types="cypress" />
import '../../support/commands';

const resizeObserverLoopErrRe = /ResizeObserver loop limit exceeded/;

describe('Adds metadata to a sample in a created project', () => {
  // before each test:
  //   1. set up the network intercepts
  //   2. Log in into biomage
  //   3. Visit data-management
  beforeEach(() => {
    cy.intercept(
      {
        method: 'PUT',
        url: '**/samples',
      },
    ).as('updateSamples');

    cy.login();
    cy.visit('/data-management');
  });

  // we have some kind of resize observer loop error that needs looking into
  Cypress.on('uncaught:exception', (err) => !resizeObserverLoopErrRe.test(err.message));

  it('fills the species using the first option', () => {
    const projectName = 'IntTest - Add Metadata Project';

    cy.selectProject(projectName);
    cy.addSpecies();

    // check that req/response are correct
    cy.wait('@updateSamples').should(({ request }) => {
      expect(request.method).to.equal('PUT');
      // also has NAME = WT1
      // expect(request.body).to.have.property('species', 'hsapiens');
    });
    //
    // // Check that the current active project contains the project title & description
    // cy.get('.ant-table-container').should((antTableContainer) => {
    //   expect(antTableContainer).to.contain('Track 1');
    // });
  });
});
