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

  const region = process.env.AWS_REGION || 'eu-west-1';
  const userPoolClient = new CognitoIdentityProviderClient(
    {
      region,
      ...additionalClientParams,
    },
  );

  const sandboxId = process.env.SANDBOX_ID || 'default';

  const { UserPools } = await userPoolClient.send(new ListUserPoolsCommand({ MaxResults: 60 }));
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

  const urlsByGithubOrg = {
    'biomage-org': {
      staging: `https://ui-${sandboxId}.scp-staging.biomage.net`,
      stagingApiUrl: `https://api-${sandboxId}.scp-staging.biomage.net`,
      stagingLoginUrl: 'biomage-staging.auth.eu-west-1.amazoncognito.com',
      production: 'https://scp.biomage.net',
      productionApiUrl: 'https://api.scp.biomage.net',
      productionLoginUrl: 'biomage.auth.eu-west-1.amazoncognito.com',
    },
    'hms-dbmi-cellenics': {
      staging: `https://ui-${sandboxId}.staging.single-cell-platform.net`,
      stagingApiUrl: `https://api-${sandboxId}.staging.single-cell-platform.net`,
      stagingLoginUrl: 'https://hms-auth-staging-160782110667.auth.us-east-1.amazoncognito.com/',
      production: 'https://cellenics.hms.harvard.edu',
      productionApiUrl: 'https://api.cellenics.hms.harvard.edu',
      productionLoginUrl: 'https://hms-auth-production-160782110667.auth.us-east-1.amazoncognito.com/',
    },
  };

  const urls = urlsByGithubOrg[process.env.GITHUB_ORG];

  switch (process.env.K8S_ENV) {
    case 'development': {
      config.baseUrl = 'http://localhost:5000';
      config.apiUrl = 'http://localhost:3000';
      config.env.loginUrl = urls.stagingLoginUrl;
      break;
    }

    case 'staging': {
      config.baseUrl = urls.staging;
      config.apiUrl = urls.stagingApiUrl;
      config.env.loginUrl = urls.stagingLoginUrl;
      break;
    }

    case 'production': {
      config.baseUrl = urls.production;
      config.apiUrl = urls.productionApiUrl;
      config.env.loginUrl = urls.productionLoginUrl;
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
