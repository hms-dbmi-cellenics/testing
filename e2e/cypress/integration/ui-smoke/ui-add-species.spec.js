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

  it('allows selection of the species for individual samples', () => {
    const projectName = 'IntTest - Add Metadata Project';

    cy.selectProject(projectName);

    // check that there is a selector for each sample
    cy.get('[data-test-class="species-select"]').should('have.length', 2);

    cy.get('[data-test-class="species-select"]').first().click();
    cy.get('.ant-select-item-option-content').first().click();

    cy.get('[data-test-class="species-select"]').last().click();
    cy.get('.ant-select-item-option-content').last().click();
  });

  it('fills the species using the first option', () => {
    const projectName = 'IntTest - Add Metadata Project';

    cy.selectProject(projectName);

    cy.fillSpecies();

    cy.wait('@updateSamples').should(({ request }) => {
      expect(request.method).to.equal('PUT');
      Object.values(request.body.samples).forEach((s) => (
        expect(s).to.have.property('species', 'hsapiens')
      ));
    });

    cy.get('[data-test-class="species-select"]').each(
      (e) => expect(e.text()).to.contain('Human'),
    );
  });
});
