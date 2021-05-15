import * as path from 'path';
import { testDataProcessing, testDataExploration } from '../lib/smoke';

const fileComponents = path.basename(__filename).split('.');
const experimentId = fileComponents[fileComponents.length - 2];
const retries = {
  retries: {
    runMode: 2,
    openMode: 1,
  },
};

describe(`Smoke test for experiment ${experimentId}`, retries, () => {
  it('runs the pipeline and moves to data exploration', () => {
    testDataProcessing(experimentId);
    testDataExploration(experimentId);
  });
});
