/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

const yaml = require('yaml');

const lib = require('./lib');

const environmentsFile = path.join(__dirname, '..', 'environments.yaml');
if (!fs.existsSync(environmentsFile)) {
  console.log(`Could not find required ${environmentsFile}`);
  console.log('You can create one by copying "environments.example.yaml"');
  process.exit(1);
}

const environments = yaml.parse(
  fs.readFileSync(environmentsFile, 'utf8'),
).Environments;

const [environment] = process.argv.slice(2);
if (!environment) {
  console.error('Missing environment: add it as a param of your npm command');
} else if (!(environment in environments)) {
  console.error(`Unkonwn environment "${environment}". The only environments in ${environmentsFile} are ${Object.keys(environments)}`);
} else {
  lib.setupEnvironment(environments[environment]);
  process.exit(0);
}
process.exit(1);
