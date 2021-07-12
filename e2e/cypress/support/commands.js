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
