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
      cy.waitUntil(() => gem2sResponses[step] !== undefined,
        {
          timeout: gem2sStepTimeOut,
          interval: 2000,
          ...config,
        }).then(() => {
        const message = gem2sResponses[step];

        cy.log('Expecting step to complete and error to be undefined');

        // GEM2S steps aren't returning "response" property in the websocket
        // Return right now, so we can check for the absence of this field to
        // Check if it's error or not.
        expect(message.response.error).to.equal(false);

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

// Cypress.Commands.add('waitForQc', (experimentId, config = {}) => {
//   Cypress.log({
//     displayName: 'QC',
//     message: 'Waiting for QC to complete',
//   });

//   const numQcSteps = 7;
//   const QCStepTimeOut = (60 * 1000) * 5; // 5 minutes;

//   cy.listenOnWebsocket((socket) => {
//     const QCResponses = [];

//     socket.on(`ExperimentUpdates-${experimentId}`, (update) => {
//       QCResponses.push(update);
//     });

//     // Create array [0, 1, 2, ... numQcSteps]
//     const waitForNSteps = [...Array(numQcSteps).keys()];

//     waitForNSteps.forEach((step) => {
//       cy.waitUntil(() => QCResponses[step] !== undefined,
//         {
//           timeout: QCStepTimeOut,
//           interval: 2000,
//           ...config,
//         }).then(() => {
//         const message = QCResponses[step];

//         console.log(`== QC step ${step + 1}`);
//         console.log(message);

//         cy.log('Expecting step to complete and error to be undefined');
//         // eslint-disable-next-line no-unused-expressions
//         expect(message.response.error).to.equal(false);

//         const log = Cypress.log({
//           displayName: 'QC',
//           message: `QC ${step + 1} completed`,
//           autoEnd: false,
//         });
//         log.snapshot(`qc-step-${step + 1}`);
//         log.end();
//       });
//     });
//   });
// });
