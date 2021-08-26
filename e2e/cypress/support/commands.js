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

  cy.contains('[data-test-class="project-card"]', projectName).find('.anticon-delete').click();
  log.snapshot('opened-delete-modal');

  cy.get('.data-test-delete-project-modal').find('input').type(projectName);
  cy.contains('Permanently delete project').click();
  log.end();
});

Cypress.Commands.add('selectProject', (projectName) => {
  const log = Cypress.log({
    displayName: 'Selecting project',
    message: [`🔐 Selecting project named ${projectName}`],
    autoEnd: false,
  });

  cy.contains('[data-test-class="project-card"]', projectName).click();

  log.end();
});

Cypress.Commands.add('launchAnalysis', () => {
  const log = Cypress.log({
    displayName: 'Launching analysis',
    message: ['launch analysis'],
    autoEnd: false,
  });

  log.snapshot('launch-analysis');
  cy.get('[data-test-id="launch-analysis-button"]').click();

  log.snapshot('launch-experiment');
  cy.get('[data-test-class="launch-analysis-item"]').contains('button', 'Launch').first().click();
  log.end();
});

/** Valid values are text in the links in the navigation menu */
Cypress.Commands.add('navigateTo', (page, config = {}) => {
  Cypress.log({
    displayName: `Navigate using to ${page}`,
    message: [`navigate to ${page}`],
  });

  cy.get('[data-test-id="navigation-menu"]').contains('a', page).click(config);
});

Cypress.Commands.add('listenOnWebsocket', (fn) => {
  const webSocketUrl = Cypress.env('webSocketUrl');

  Cypress.log({
    displayName: 'Connect to websocket',
    message: `Connect to websocket on ${webSocketUrl}`,
  });

  const io = socketIOClient(webSocketUrl, { transports: ['websocket'] });

  // Callbacks will have scope to io object
  fn(io);
});

Cypress.Commands.add('waitForGem2s', (experimentId, config = {}) => {
  Cypress.log({
    displayName: 'GEM2S',
    message: 'Waiting for GEM2S to complete',
  });

  const numGem2sSteps = 7;
  const gem2sStepTimeOut = (60 * 1000) * 5; // 5 minutes;

  cy.listenOnWebsocket((socket) => {
    const gem2sResponses = [];

    socket.on(`ExperimentUpdates-${experimentId}`, (update) => {
      gem2sResponses.push(update);
    });

    // Create array [0, 1, 2, ... numGem2sSteps]
    const waitForNSteps = [...Array(numGem2sSteps).keys()];

    waitForNSteps.forEach((step) => {
      cy.waitUntil(() => {
        if (gem2sResponses.length === 0) return false;
        const latestResponse = gem2sResponses.pop();
        return latestResponse;
      },
      {
        timeout: gem2sStepTimeOut,
        interval: 2000,
        ...config,
      }).then((message) => {
        cy.log('Expecting step to complete and error to be undefined');

        // GEM2S steps doesn't "response" property if it's not error
        expect(message.response).to.equal(undefined);

        const log = Cypress.log({
          displayName: 'GEM2S',
          message: `GEM2S task ${message.taskName} completed - step ${step + 1} of ${numGem2sSteps}`,
          autoEnd: false,
        });
        log.snapshot(`gem2s-step-${step + 1}`);
        log.end();
      });
    });
  });
});

Cypress.Commands.add('waitForQc', (experimentId, config = {}) => {
  Cypress.log({
    displayName: 'QC',
    message: 'Waiting for QC to complete',
  });

  const qcSteps = [
    // 'classifier', not checked as a prerequisite to pass
    'cellSizeDistribution',
    'mitochondrialContent',
    'numGenesVsNumUmis',
    'doubletScores',
    'configureEmbedding',
    'dataIntegration',
  ];

  const qcStepTimeOut = (60 * 1000) * 10; // 10 minutes;

  cy.listenOnWebsocket((socket) => {
    const qcResponses = [];

    socket.on(`ExperimentUpdates-${experimentId}`, (update) => {
      qcResponses.push(update);
    });

    qcSteps.forEach((stepName, stepIdx) => {
      cy.waitUntil(() => {
        if (qcResponses.length === 0) return false;
        const latestResponse = qcResponses.pop();
        if (latestResponse.input.taskName !== stepName) return false;
        return latestResponse;
      },
      {
        timeout: qcStepTimeOut,
        interval: 2000,
        ...config,
      }).then((message) => {
        cy.log('Expecting step to complete and error to be false');
        expect(message.response.error).to.equal(false);

        const log = Cypress.log({
          displayName: 'QC',
          message: `QC task ${message.input.taskName} completed - step ${stepIdx + 1} of ${qcSteps.length}`,
          autoEnd: false,
        });
        log.snapshot(`qc-step-${stepIdx + 1}`);
        log.end();
      });
    });
  });
});
