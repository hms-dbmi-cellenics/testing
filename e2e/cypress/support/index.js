/* eslint-disable import/no-extraneous-dependencies */
require('cypress-terminal-report/src/installLogsCollector')(
  { collectTypes: ['cons:warn', 'cons:error', 'cy:log', 'cy:xhr', 'cy:request', 'cy:route', 'cy:intercept', 'cy:command'] },
);
