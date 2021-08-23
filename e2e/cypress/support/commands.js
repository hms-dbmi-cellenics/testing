import { Auth } from 'aws-amplify';
import 'cypress-localstorage-commands';
import 'cypress-wait-until';
import socketIOClient from 'socket.io-client';

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
    displayName: 'Selecting a Project',
    message: ['Selecting a project'],
    autoEnd: false,
  });

  log.snapshot('select-project');
  cy.contains('.project-card', projectName).click();
  log.end();
});

Cypress.Commands.add('launchAnalysis', () => {
  const log = Cypress.log({
    displayName: 'Launching analysis',
    message: ['launch analysis'],
    autoEnd: false,
  });

  log.snapshot('launch-analysis');
  cy.contains('button', 'Launch analysis').click();

  log.snapshot('launch-first-experiment');
  cy.contains('button', /^Launch$/).first().click();
  log.end();
});

Cypress.Commands.add('navigateTo', (page, config = {}) => {
  const log = Cypress.log({
    displayName: `Navigate using to ${page}`,
    message: [`navigate to ${page}`],
    autoEnd: false,
  });

  cy.get('aside').contains('a', page).click(config);
  log.end();
});

Cypress.Commands.add('listenOnWebsocket', (fn) => {
  const webSocketUrl = Cypress.env('webSocketUrl');

  const log = Cypress.log({
    displayName: 'Connect to websocket',
    message: `Connect to websocket on ${webSocketUrl}`,
  });

  const io = socketIOClient(webSocketUrl, { transports: ['websocket'] });

  // Callbacks will have scope to io object
  fn(io);
});

Cypress.Commands.add('runGem2s', (experimentId, config = {}) => {
  Cypress.log({
    displayName: 'GEM2S',
    message: 'Listening for GEM2S responses',
  });

  const numGem2sSteps = 6;
  const gem2sStepTimeOut = (60 * 1000) * 5; // 30 minutes;

  cy.listenOnWebsocket((socket) => {
    const gem2sResults = [];

    socket.on(`ExperimentUpdates-${experimentId}`, (update) => {
      gem2sResults.push(update);
    });

    // Create array [0, 1, 2, ... 5]
    const waitForNSteps = [...Array(numGem2sSteps).keys()];

    waitForNSteps.forEach((step) => {
      cy.waitUntil(() => gem2sResults[step] !== undefined,
        {
          timeout: gem2sStepTimeOut,
          interval: 2000,
          ...config,
        }).then(() => {
        const message = gem2sResults[step];

        cy.log('Expecting step to complete and error to be undefined');
        expect(message.response?.error).to.be.undefined;

        const log = Cypress.log({
          displayName: 'GEM2S',
          message: `GEM2S step ${step + 1} completed`,
          autoEnd: false,
        });
        log.snapshot(`gem2s-step-${step + 1}`);
        log.end();
      });
    });
  });
});
