/* eslint-disable global-require */
const {
  CognitoIdentityProviderClient,
  ListUserPoolsCommand,
  ListUserPoolClientsCommand,
} = require('@aws-sdk/client-cognito-identity-provider');
const { getDefaultRoleAssumerWithWebIdentity } = require('@aws-sdk/client-sts');

const { fromTokenFile } = require('@aws-sdk/credential-provider-web-identity');

module.exports = async (on, config) => {
  // eslint-disable-next-line import/no-extraneous-dependencies
  require('cypress-terminal-report/src/installLogsPrinter')(on, { printLogsToConsole: 'always' });

  let additionalClientParams = {};
  if (process.env.NODE_ENV !== 'development' && process.env.NODE_ENV) {
    additionalClientParams = {
      ...additionalClientParams,
      credentials: fromTokenFile({
        roleAssumerWithWebIdentity: getDefaultRoleAssumerWithWebIdentity(),
      }),
    };
  }

  const userPoolClient = new CognitoIdentityProviderClient(
    {
      region: 'eu-west-1',
      ...additionalClientParams,
    },
  );

  const sandboxId = process.env.SANDBOX_ID || 'default';

  const { UserPools } = await userPoolClient.send(new ListUserPoolsCommand({ MaxResults: 60 }));
  console.log('user pool', UserPools);
  // setting the user pool id
  const environment = process.env.K8S_ENV || 'development';
  const cognitoEnv = environment === 'development' ? 'staging' : environment; // development env uses staging cognito pool
  const userPoolId = UserPools.find((pool) => pool.Name.includes(cognitoEnv)).Id;
  config.env.userPoolId = userPoolId;

  // setting the client id
  const { UserPoolClients } = await userPoolClient.send(
    new ListUserPoolClientsCommand({ UserPoolId: userPoolId, MaxResults: 60 }),
  );
  const userPoolClientId = UserPoolClients.find((client) => client.ClientName.includes(
    `cluster-${sandboxId}`,
  )).ClientId;
  config.env.clientId = userPoolClientId;

  switch (process.env.K8S_ENV) {
    case 'development': {
      config.baseUrl = 'http://localhost:5000';
      config.env.loginUrl = 'biomage-staging.auth.eu-west-1.amazoncognito.com';
      break;
    }

    case 'staging': {
      config.baseUrl = `https://ui-${sandboxId}.scp-staging.biomage.net`;
      config.env.loginUrl = 'biomage-staging.auth.eu-west-1.amazoncognito.com';
      break;
    }

    case 'production': {
      config.baseUrl = 'https://scp.biomage.net';
      config.env.loginUrl = 'biomage.auth.eu-west-1.amazoncognito.com';
      break;
    }

    default: {
      throw new Error('K8S_ENV must be set to either \'development\', \'staging\', or \'production\'');
    }
  }
  if (!config.env.E2E_USERNAME) {
    throw new Error('CYPRESS_E2E_USERNAME must be a valid username for log into the platform.');
  }

  if (!config.env.E2E_PASSWORD) {
    throw new Error('CYPRESS_E2E_PASSSWORD must be a valid username for logging into the platform.');
  }

  return config;
};
