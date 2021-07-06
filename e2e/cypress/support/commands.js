// Example login flow for testing authentication/authorization.
import Amplify, { Auth } from 'aws-amplify';

Amplify.configure({
  Auth: {
    mandatorySignIn: true,
    region: "eu-west-1",
    userPoolId: Cypress.env("userPoolId"),
    identityPoolId: Cypress.env("identityPoolId"),
    userPoolWebClientId: Cypress.env("appClientId"),
    oauth: {
        domain: Cypress.env("domain"),
        scope: ['email', 'profile', 'aws.cognito.signin.user.admin', 'openid'],
        redirectSignIn: Cypress.env("redirect"),
        redirectSignOut: Cypress.env("redirect"),
        responseType: 'code',
        options: {
            AdvancedSecurityDataCollectionFlag: false
        }
    }
  }
});

Cypress.Commands.add("login", (email, password) => {
  return Auth.signIn(email, password)
      .then(user => {
        console.log('===> user', user);

        let session = Auth.currentSession();

        console.log('===> session', session);
      })
      .catch(err => console.log('===> err', err));
})