const path = require('path');
const fs = require('fs');
const process = require('process');

const glob = require('glob');

const templates = ['smoke.spec.*.js'];
const templateFolder = path.join(__dirname, 'cypress', 'integration-template');
const specsFolder = path.join(__dirname, 'cypress', 'integration');

const cleanUp = () => {
  templates.forEach((template) => {
    glob(path.join(specsFolder, template), (err, files) => {
      if (files) {
        files.forEach((fileName) => fs.unlinkSync(fileName));
      }
    });
  });
};
const createSpecs = () => {
  const experiments = 'EXPERIMENT_IDS' in process.env ? process.env.EXPERIMENT_IDS : 'e52b39624588791a7889e39c617f669e';
  templates.forEach((template) => {
    const src = path.join(templateFolder, template.replace('.*', ''));
    experiments.split(':').forEach((experimentId) => {
      const tgt = path.join(specsFolder, template.replace('*', experimentId));
      fs.copyFileSync(src, tgt);
    });
  });
};

cleanUp();
createSpecs();
