module.exports = (on, config) => {
  switch (process.env.K8S_ENV) {
    case 'development': {
      config.baseUrl = 'https://localhost:3000';
      config.env.loginUrl = 'biomage-staging.auth.eu-west-1.amazoncognito.com';
      break;
    }

    case 'staging': {
      config.baseUrl = 'https://ui-default.scp-staging.biomage.net';
      config.env.loginUrl = 'biomage-staging.auth.eu-west-1.amazoncognito.com';
      break;
    }

    case 'production': {
      config.baseUrl = 'https://scp.biomage.net';
      config.env.loginUrl = 'biomage.auth.eu-west-1.amazoncognito.com';
      break;
    }

    default: {
      throw new Error('K8S_ENV must be set to ehtier \'development\', \'staging\', or \'production\'');
    }
  }

  // if (!process.env.E2E_LOGIN_USER) {
  //   throw new Error('LOGIN_USER must be a valid username for log into the platform.');
  // }

  // if (!process.env.E2E_LOGIN_PASSWORD) {
  //   throw new Error('LOGIN_PASSWORD must be a valid username for logging into the platform.');
  // }

  // config.env.username = process.env.E2E_LOGIN_USER;
  // config.env.password = process.env.E2E_LOGIN_PASSWORD;

  return config;
};
