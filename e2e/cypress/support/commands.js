// Example login flow for testing authentication/authorization.
import Amplify, { Auth } from 'aws-amplify';
import 'cypress-localstorage-commands';

// Amplify.configure({
//   Auth: {
//     mandatorySignIn: true,
//     region: 'eu-west-1',
//     UserPoolId: Cypress.env('userPoolId'),
//     ClientId: Cypress.env('appClientId'),
//     identityPoolId: Cypress.env("identityPoolId"),
//     userPoolWebClientId: Cypress.env("appClientId"),
//     oauth: {
//       domain: Cypress.env('domain'),
//       scope: ['email', 'profile', 'aws.cognito.signin.user.admin', 'openid'],
//       redirectSignIn: Cypress.env('redirect'),
//       redirectSignOut: Cypress.env('redirect'),
//       responseType: 'code',
//       options: {
//         AdvancedSecurityDataCollectionFlag: false,
//       },
//     },
//   },
// });

console.log('USER POOL ID IS ', Cypress.env('userPoolId'), ' EMAIL ', Cypress.env('username'), 'PASSWORD IS ', Cypress.env('password'));

Cypress.Commands.add('login', () => {
  const username = Cypress.env('username');
  const password = Cypress.env('password');
  const awsConfig = {
    aws_user_pools_id: Cypress.env('userPoolId'),
    aws_user_pools_web_client_id: Cypress.env('clientId'),
  };
  Auth.configure(awsConfig);

  cy.then(
    () => Auth.signIn(username, password),
  )
    .then((cognitoUser) => {
      console.log('===> user', cognitoUser);
      const idToken = cognitoUser.signInUserSession.idToken.jwtToken;
      const accessToken = cognitoUser.signInUserSession.accessToken.jwtToken;

      const makeKey = (name) => `CognitoIdentityServiceProvider.${cognitoUser.pool.clientId}.${cognitoUser.username}.${name}`;

      cy.setLocalStorage(makeKey('accessToken'), accessToken);
      cy.setLocalStorage(makeKey('idToken'), idToken);
      cy.setLocalStorage(
        `CognitoIdentityServiceProvider.${cognitoUser.pool.clientId}.LastAuthUser`,
        cognitoUser.username,
      );
    });
  cy.saveLocalStorage();
});
