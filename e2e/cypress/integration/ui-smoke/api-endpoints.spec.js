import '../../support/commands';
import { v4 as uuidv4 } from 'uuid';

describe('API endpoints work as expected', () => {
  before(() => {
    cy.login();
  });

  const { apiUrl } = Cypress.config();
  const experimentId = '38eacf24-3f53-45ab-997d-36df0944f05d';
  const jwt = localStorage.getItem('idToken');

  const getRequestHeader = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${jwt}`,
  });

  it('Api endpoints work for experiments', () => {
    cy.log(`create experiment ${jwt}`);
    const requestHeaders = getRequestHeader();

    cy.request({
      method: 'POST',
      url: `${apiUrl}/v2/experiments/${experimentId}`,
      headers: requestHeaders,
      body: JSON.stringify({
        id: experimentId,
        name: 'randomName',
        description: 'test create experiment endpoint',
      }),
    }).then((response) => {
      expect(response.status).equal(200);
    });

    cy.log('get experiment');
    cy.request({
      method: 'GET',
      url: `${apiUrl}/v2/experiments/${experimentId}`,
      headers: requestHeaders,
    }).then((response) => {
      expect(response.status).equal(200);
    });

    cy.log('patch experiment');
    cy.request({
      method: 'PATCH',
      url: `${apiUrl}/v2/experiments/${experimentId}`,
      headers: requestHeaders,
      body: JSON.stringify({
        name: 'newPatchedExperimentName',
      }),
    }).then((response) => {
      expect(response.status).equal(200);
    });

    cy.log('create sample file');
    cy.request({
      method: 'POST',
      url: `${apiUrl}/v2/experiments/${experimentId}/samples`,
      headers: requestHeaders,
      body: JSON.stringify([{
        name: 'sampleName',
        sampleTechnology: '10x',
        options: {},
      }]),
    }).then((response) => {
      const sampleId = response.body.sampleName;
      expect(Object.keys(response.body)[0]).equal('sampleName');

      cy.log('create sample file');
      cy.request({
        method: 'POST',
        url: `${apiUrl}/v2/experiments/${experimentId}/samples/${sampleId}/sampleFiles/barcodes10x`,
        headers: requestHeaders,
        body: JSON.stringify({
          sampleFileId: uuidv4(),
          size: 420,
          metadata: {},
        }),
      }).then((createSampleFileResponse) => {
        expect(createSampleFileResponse.status).equal(200);
      });

      cy.log('patch sample');
      cy.request({
        method: 'PATCH',
        url: `${apiUrl}/v2/experiments/${experimentId}/samples/${sampleId}`,
        headers: requestHeaders,
        body: JSON.stringify({
          name: 'newPatchedName',
        }),
      }).then((patchSampleResponse) => {
        expect(patchSampleResponse.status).equal(200);
      });

      cy.log('patch sample file');
      cy.request({
        method: 'PATCH',
        url: `${apiUrl}/v2/experiments/${experimentId}/samples/${sampleId}/sampleFiles/barcodes10x`,
        headers: requestHeaders,
        body: JSON.stringify({
          uploadStatus: 'uploaded',
        }),
      }).then((patchSampleFileResponse) => {
        expect(patchSampleFileResponse.status).equal(200);
      });

      cy.log('delete sample');
      cy.request({
        method: 'DELETE',
        url: `${apiUrl}/v2/experiments/${experimentId}/samples/${sampleId}`,
        headers: requestHeaders,
      }).then((deleteSampleResponse) => {
        expect(deleteSampleResponse.status).equal(200);
      });
    });

    cy.log('get userpool client id');
    cy.request({
      method: 'GET',
      url: `${apiUrl}/v2/programmaticInterfaceClient`,
      headers: requestHeaders,
    }).then((response) => {
      expect(response.status).equal(200);
      const returnedKeys = Object.keys(response.body);
      expect(returnedKeys[0]).equal('clientId');
      expect(returnedKeys[1]).equal('clientRegion');
    });
  });

  after(() => {
    cy.log('deleting created experiment');
    cy.request({
      method: 'DELETE',
      url: `${apiUrl}/v2/experiments/${experimentId}`,
      headers: getRequestHeader(),
    }).then((response) => {
      expect(response.status).equal(200);
    });
  });
});
