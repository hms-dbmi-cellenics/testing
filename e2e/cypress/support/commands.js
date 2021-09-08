import { Auth } from 'aws-amplify';
import 'cypress-localstorage-commands';
import 'cypress-wait-until';

Cypress.Commands.add('login', () => {
  const username = Cypress.env('E2E_USERNAME'); // you should set the CYPRESS_E2E_USERNAME env variable
  const password = Cypress.env('E2E_PASSWORD'); // you should set the CYPRESS_E2E_PASSWORD env variable

  const log = Cypress.log({
    displayName: 'Logging into Cognito',
    message: [`🔐 Authenticating with ${username}`],
    autoEnd: false,
  });

  log.snapshot('before');

  const awsConfig = {
    aws_user_pools_id: Cypress.env('userPoolId'),
    aws_user_pools_web_client_id: Cypress.env('clientId'),
  };
  Auth.configure(awsConfig);

  const signIn = Auth.signIn({ username, password });

  cy.wrap(signIn, { log: false }).then((cognitoResponse) => {
    cy.log(cognitoResponse);

    const keyPrefixWithUsername = `${cognitoResponse.keyPrefix}.${cognitoResponse.username}`;

    cy.setLocalStorage(
      `${keyPrefixWithUsername}.idToken`,
      cognitoResponse.signInUserSession.idToken.jwtToken,
    );

    cy.setLocalStorage(
      `${keyPrefixWithUsername}.accessToken`,
      cognitoResponse.signInUserSession.accessToken.jwtToken,
    );

    cy.setLocalStorage(
      `${keyPrefixWithUsername}.refreshToken`,
      cognitoResponse.signInUserSession.refreshToken.token,
    );

    cy.setLocalStorage(
      `${keyPrefixWithUsername}.clockDrift`,
      cognitoResponse.signInUserSession.clockDrift,
    );

    cy.setLocalStorage(
      `${cognitoResponse.keyPrefix}.LastAuthUser`,
      cognitoResponse.username,
    );

    cy.setLocalStorage('amplify-authenticator-authState', 'signedIn');
    cy.setLocalStorage('amplify-signin-with-hostedUI', 'true');

    log.snapshot('after');
    log.end();
  });
});

Cypress.Commands.add('createProject', (projectName, projectDescription) => {
  const log = Cypress.log({
    displayName: 'Creating Project',
    message: [`🔐 Creating project named ${projectName}`],
    autoEnd: false,
  });

  log.snapshot('open-modal');
  cy.get('[data-test-id="create-new-project-button"]').click({ force: true });
  log.snapshot('type-name');
  cy.get('[data-test-id="project-name"]').type(projectName);
  log.snapshot('type-description');
  cy.get('[data-test-id="project-description"]').type(projectDescription);
  cy.get('[data-test-id="confirm-create-new-project"]').click();
  log.end();
});

Cypress.Commands.add('deleteProject', (projectName) => {
  const log = Cypress.log({
    displayName: 'Deleting Project',
    message: [`🔐 Deleting project named ${projectName}`],
    autoEnd: false,
  });

  cy.contains('[data-test-class="data-test-project-card"]', projectName).find('.anticon-delete').click();
  log.snapshot('opened-delete-modal');

  cy.get('.data-test-delete-project-modal').find('input').type(projectName);
  cy.contains('Permanently delete project').click();
  log.end();
});

Cypress.Commands.add('selectProject', (projectName, waitForProjectToAppear = true) => {
  const log = Cypress.log({
    displayName: 'Selecting project',
    message: [`🔐 Selecting project named ${projectName}`],
    autoEnd: false,
  });

  cy.contains('[data-test-class="data-test-project-card"]', projectName).click({ force: !waitForProjectToAppear });

  log.end();
});

Cypress.Commands.add('addMetadata', () => {
  const log = Cypress.log({
    displayName: 'Adding metadata',
    message: ['🔐 Adding metadata track'],
    autoEnd: false,
  });

  cy.contains('button', 'Add metadata').click();

  log.snapshot('opened-add-metadata-popover');

  cy.contains('.ant-popover', 'Provide new metadata track name').find('.anticon-check').click();

  log.snapshot('closed-add-metadata-popover');

  log.end();
});

Cypress.Commands.add('deleteMetadata', (metadataTrackName = 'Track 1') => {
  const log = Cypress.log({
    displayName: 'Delete metadata',
    message: [`🔐 Deleting metadata track named ${metadataTrackName}`],
    autoEnd: false,
  });

  cy.contains('.ant-table-cell', 'Track 1').find('.anticon-delete').click();

  log.snapshot('deleted-metadata');

  log.end();
});

Cypress.Commands.add('randomizeSampleName', (samplePosition) => {
  const log = Cypress.log({
    displayName: 'Modifying sample name',
    message: ['Modifying sample name to ensure GEM2S and QC launch'],
    autoEnd: false,
  });

  const randomSampleName = `Test-${Math.round(Math.random() * 10000)}`;

  // eq(samplePosition) because the 1st cell (index 0) is the header
  cy.get('.data-test-sample-cell').eq(samplePosition).then(($sample) => {
    cy.wrap($sample).find('.anticon-edit').click();
    log.snapshot('editing-sample-name');

    cy.wrap($sample).find('input').type('{selectall}{backspace}').type(randomSampleName);
    log.snapshot('edited-sample-name');

    cy.wrap($sample).find('.anticon-check').click();
    log.snapshot('save-new-sample-name');
  });

  log.end();
});

Cypress.Commands.add('launchAnalysis', () => {
  const log = Cypress.log({
    displayName: 'Launching analysis',
    message: ['launch analysis'],
    autoEnd: false,
  });

  cy.get('[data-test-id="launch-analysis-button"]').click();
  log.snapshot('launch-analysis');

  cy.get('[data-test-class="data-test-launch-analysis-item"]').contains('button', /^Launch$/).first().click();
  log.snapshot('launch-experiment');
  log.end();
});

Cypress.Commands.add('waitForGem2s', (timeout) => {
  const log = Cypress.log({
    displayName: 'GEM2S',
    message: 'Waiting for GEM2S to complete',
  });

  // Check that launching gem2s does not fail
  cy.contains('We\'ve had an issue while launching your analysis.').should('have.length', 0);
  log.snapshot('launch-experiment');

  cy.contains('We\'re launching your analysis...', { timeout });
  log.snapshot('gem2s-runs');

  // Wait for data processing to show up
  cy.contains('.data-test-page-header', 'Data Processing', { timeout }).should('exist');
  log.snapshot('data-processing');
  log.end();
});

Cypress.Commands.add('waitForQc', (timeout, numQcSteps = 7) => {
  const log = Cypress.log({
    displayName: 'QC',
    message: 'Waiting for QC to complete',
  });

  cy.waitUntil(() => {
    cy.get('svg[data-test-class="data-test-qc-step-error"]').then(($error) => {
      if ($error.length > 0) throw new Error('QC step failed');
    });

    return cy.get('svg[data-test-class="data-test-qc-step-completed"]', { timeout }).should('have.length', numQcSteps);
  },
  {
    timeout,
    interval: 5000,
  });

  log.snapshot('qc-completed');
  log.end();
});
