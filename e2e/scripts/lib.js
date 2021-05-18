/* eslint-disable no-console */
const path = require('path');
const fs = require('fs');
const glob = require('glob');

const cfgTemplate = require('../cypress.template.json');

const templates = ['smoke.spec.*.js'];
const templateFolder = path.join(__dirname, '..', 'cypress', 'integration-template');
const specsFolder = path.join(__dirname, '..', 'cypress', 'integration');

const cleanUpSpecs = () => {
  templates.forEach((template) => {
    const files = glob.sync(path.join(specsFolder, template));
    files.forEach((fileName) => {
      fs.unlinkSync(fileName);
      console.log(`Deleting ${fileName}`);
    });
  });
};
const createSpecs = (experiments) => {
  templates.forEach((template) => {
    const src = path.join(templateFolder, template.replace('.*', ''));
    experiments.forEach((experimentId) => {
      const tgt = path.join(specsFolder, template.replace('*', experimentId));
      console.log(`Creating ${tgt}`);
      fs.copyFileSync(src, tgt);
    });
  });
};

const createConfig = (baseUrl) => {
  const cfg = cfgTemplate;
  cfg.baseUrl = baseUrl;

  const tgtPath = path.join(__dirname, '..', 'cypress.json');
  fs.writeFileSync(tgtPath, JSON.stringify(cfg, null, 2));
};

const setupEnvironment = (envObj) => {
  const { url, experiments } = envObj;
  createConfig(url);
  cleanUpSpecs();
  createSpecs(experiments);
};

module.exports = {
  cleanUpSpecs,
  createSpecs,
  setupEnvironment,
};
