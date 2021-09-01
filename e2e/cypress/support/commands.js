import { Auth } from 'aws-amplify';
import 'cypress-localstorage-commands';

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
  cy.get('#create-new-project-modal').click({ force: true });
  log.snapshot('type-name');
  cy.get('#project-name').type(projectName);
  log.snapshot('type-description');
  cy.get('#project-description').type(projectDescription);
  cy.get('#confirm-create-new-project').click();
  log.end();
});

Cypress.Commands.add('deleteProject', (projectName) => {
  const log = Cypress.log({
    displayName: 'Deleting Project',
    message: [`🔐 Deleting project named ${projectName}`],
    autoEnd: false,
  });

  cy.contains('.project-card', projectName).find('.anticon-delete').click();
  log.snapshot('opened-delete-modal');

  cy.get('.delete-project-modal').find('input').type(projectName);
  cy.contains('Permanently delete project').click();
  log.end();
});

Cypress.Commands.add('selectProject', (projectName) => {
  const log = Cypress.log({
    displayName: 'Selecting project',
    message: [`🔐 Selecting project named ${projectName}`],
    autoEnd: false,
  });

  cy.get('[data-test-class="project-card"]').contains(projectName).click();

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

Cypress.Commands.add('deleteMetadata', (metadataTrackName) => {
  const log = Cypress.log({
    displayName: 'Adding metadata',
    message: [`🔐 Adding metadata track named ${metadataTrackName}`],
    autoEnd: false,
  });

  cy.contains('.ant-table-cell', 'Track 1').find('.anticon-delete').click();

  log.snapshot('deleted-metadata');

  log.end();
});

Cypress.Commands.add('fillSpecies', () => {
  const log = Cypress.log({
    displayName: 'Filling species',
    message: ['Selecting first species from dropdown for all samples'],
    autoEnd: false,
  });

  cy.get('[data-test-id="fill-species"]').click();

  cy.get('[data-test-id="fill-species-select"]').click();

  cy.get('.ant-select-item-option-content').first().click();

  cy.get('button').contains('Replace all').click();

  log.snapshot('Species form filled');

  log.end();
});
