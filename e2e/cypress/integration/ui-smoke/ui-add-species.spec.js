/// <reference types="cypress" />
import '../../support/commands';

const resizeObserverLoopErrRe = /ResizeObserver loop limit exceeded/;

describe('Adds species to samples in a created project', () => {
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
    cy.fillSpecies();

    // check that req/response are correct
    cy.wait('@updateSamples').should(({ request }) => {
      expect(request.method).to.equal('PUT');
      expect(Object.values(request.body.samples)[0]).to.have.property('species', 'hsapiens');
    });

    cy.get('[data-test-class="species-select"]').each(
      (e) => expect(e.text()).to.contain('Human'),
    );
  });
});
