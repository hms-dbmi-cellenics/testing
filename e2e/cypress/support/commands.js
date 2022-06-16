import 'cypress-wait-until';
import 'cypress-localstorage-commands';

import { dragAndDropFiles, selectFilesFromInput } from './commandsHelpers';

import { Auth } from 'aws-amplify';
import { addFileActions } from '../constants';

Cypress.Commands.add('login', () => {
  const username = Cypress.env('E2E_USERNAME');
  const password = Cypress.env('E2E_PASSWORD');

  const log = Cypress.log({
    displayName: 'Logging into Cognito',
    message: [`🔐 Authenticating with ${username}`],
    autoEnd: false,
  });

  const awsConfig = {
    aws_user_pools_id: Cypress.env('userPoolId'),
    aws_user_pools_web_client_id: Cypress.env('clientId'),
  };
  Auth.configure(awsConfig);

  const signIn = Auth.signIn({ username, password });

  cy.wrap(signIn, { log: false, timeout: 10000 }).then((cognitoResponse) => {
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

    log.end();
  });
});

Cypress.Commands.add('createProject', (projectName, projectDescription) => {
  cy.log(`Creating project with name ${projectName}.`);

  cy.get('[data-test-id="create-new-project-button"]').click({ force: true });
  cy.get('[data-test-id="project-name"]', { timeout: 5000 }).type(projectName);

  if (projectDescription) {
    cy.get('[data-test-id="project-description"]').type(projectDescription);
  }

  cy.get('[data-test-id="confirm-create-new-project"]').click({ force: true });
});

Cypress.Commands.add('deleteProject', (projectName) => {
  cy.log(`Deleting project with name ${projectName}.`);

  cy.contains('[data-test-class="data-test-project-card"]', projectName)
    .within(() => (
      cy.get('[data-test-class="data-test-delete-editable-field-button"]').click({ force: true })
    ));

  cy.get('[data-test-id="data-test-delete-project-input"]').type(projectName);
  cy.contains('Permanently delete project').click();
});

Cypress.Commands.add('selectProject', (projectName, waitForProjectToAppear = true) => {
  cy.log(`Selecting project with name ${projectName}`);
  cy.contains('[data-test-class="data-test-project-card"]', projectName).click({ force: !waitForProjectToAppear });
});

Cypress.Commands.add('addMetadata', () => {
  cy.log('Adding metadata track.');

  cy.contains('button', 'Add metadata').click();
  cy.contains('.ant-popover', 'Provide new metadata track name').find('.anticon-check').click();
});

Cypress.Commands.add('deleteMetadata', (metadataTrackName = 'Track 1') => {
  cy.log(`Deleting metadata track named ${metadataTrackName}`);
  cy.contains('.ant-table-cell', 'Track 1').find('.anticon-delete').click();
});

// IMPORTANT only works with files that are uncompressed, gem2s fails with compressed files
// (probably due to file sizes wrong calculation, if we consider this should be fixed
// the work should probably be done in the forked repo cypress-file-upload)
Cypress.Commands.add('addSample', (sample, addFileAction) => {
  cy.log(`Adding sample files for ${sample}`);
  cy.get('[data-test-id="add-samples-button"]').click({ force: true });

  const filesToAdd = [`${sample}/matrix.mtx`, `${sample}/barcodes.tsv`, `${sample}/features.tsv`];

  if (addFileAction === addFileActions.DRAG_AND_DROP) {
    dragAndDropFiles(filesToAdd);
  } else if (addFileAction === addFileActions.SELECT_INPUT) {
    selectFilesFromInput(filesToAdd);
  }

  cy.get('[data-test-id="file-upload-button"]').click();
});

Cypress.Commands.add('removeSample', () => {
  cy.log('Removing sample.');

  cy.contains('.data-test-sample-in-table-name', 'WT1')
    .within(() => (
      cy.get('[data-test-class="data-test-delete-editable-field-button"]').click({ force: true })
    ));
});

Cypress.Commands.add('randomizeSampleName', (samplePosition) => {
  cy.log('Randomizing sample names.');
  const randomSampleName = `Test-${Math.round(Math.random() * 10000)}`;

  cy.get('.data-test-sample-cell').eq(samplePosition).find('.anticon-edit').click();
  cy.get('.data-test-sample-cell').eq(samplePosition).find('input').type(`{selectall}{backspace}${randomSampleName}`);
  cy.get('.data-test-sample-cell').eq(samplePosition).find('.anticon-check').click();
});

Cypress.Commands.add('changeMetadataNames', (metadataPosition) => {
  cy.log('Randomizing metadata values.');

  cy.get('.anticon-format-painter').eq(metadataPosition).click();
  cy.get('.ant-popover-content').find('input').type('{selectall}{backspace}').type(`TestValue-${Math.round(Math.random() * 10000)}`);
  cy.contains('button', 'Fill all missing').click();
});

Cypress.Commands.add('waitForGem2s', (timeout) => {
  cy.log('Waiting for GEM2S to complete...');
  cy.contains('We\'re launching your analysis...', { timeout: 60000 }); // wait for 1 minute

  cy.contains('.data-test-page-header', 'Data Processing', { timeout }).should('exist');
});

Cypress.Commands.add('waitForQc', (timeout, numQcSteps = 7) => {
  cy.log('Waiting for QC to complete...');
  cy.waitUntil(
    () => {
      cy.get('span[data-test-id="qc-status-text"]').then(
        ($text) => {
          if ($text.text() === 'failed') throw new Error('QC Step failed');
        },
      );
      return cy.get('svg[data-test-class="data-test-qc-step-completed"]', { timeout }).should('have.length', numQcSteps);
    },
    {
      timeout,
      interval: 5000,
    },
  );
});

Cypress.Commands.add('cleanUpProjectsIfNecessary', () => {
  cy.log('Cleaning up projects if necessary...');

  cy.get('body').then(($body) => {
    if ($body.find('[data-test-class="data-test-project-card"]').length > 0) {
      cy.get('[data-test-class=data-test-project-card]', { timeout: 10000 }).each(($el, index, $list) => {
        const projectName = $el.find('span:first', { timeout: 5000 }).text();
        cy.selectProject(projectName, false);
        cy.deleteProject(projectName);
      });
    }
  });
});
