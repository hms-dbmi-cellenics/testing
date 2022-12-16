import '../../support/commands';

describe('API endpoints work as expected', () => {
  beforeEach(() => {
    cy.login();
  });

  it('Api urls work', () => {
    const jwt = localStorage.getItem('idToken');
    const { apiUrl } = Cypress.config();
    const experimentId = '38eacf24-3f53-45ab-997d-36df0944f05d';

    // create experiment endpoint
    cy.request({
      method: 'POST',
      url: `${apiUrl}/v2/experiments/${experimentId}`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify({
        id: experimentId,
        name: 'randomName',
        description: 'test create experiment endpoint',
      }),
    }).then((response) => {
      expect(response.status).equal(200);
    });

    // get experiment endpoint
    cy.request({
      method: 'GET',
      url: `${apiUrl}/v2/experiments/${experimentId}`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`,
      },
    }).then((response) => {
      expect(response.status).equal(200);
    });

    // delete experiment
    cy.request({
      method: 'DELETE',
      url: `${apiUrl}/v2/experiments/${experimentId}`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`,
      },
    }).then((response) => {
      expect(response.status).equal(200);
    });
  });
});
