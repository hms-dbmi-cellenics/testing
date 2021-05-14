import * as path from 'path';
import { testDataProcessing, testDataExploration } from '../lib/smoke';

const fileComponents = path.basename(__filename).split('.');
const experimentId = fileComponents[fileComponents.length - 2];

context(`Smoke test for experiment ${experimentId}`, () => {
  it('runs the pipeline and moves to data exploration', () => {
    testDataProcessing(experimentId);
    testDataExploration(experimentId);
  });
});
