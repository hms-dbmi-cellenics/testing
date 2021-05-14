import processingUpdate from '../fixtures/processingConfig.json';

context('Smoke Test', () => {
  const EXPERIMENT_IDS = Cypress.env('EXPERIMENT_IDS') ?? 'e52b39624588791a7889e39c617f669e';
  const SECONDS_PER_STEP = Cypress.env('SECONDS_PER_STEP') ?? 360;

  const isLocalEnv = () => Cypress.config().baseUrl.startsWith('http://localhost');

  const getApiServer = () => {
    const { baseUrl } = Cypress.config();
    let server = 'http://localhost:3000';
    if (!isLocalEnv()) {
      server = baseUrl.replace('//ui-', '//api-');
    }
    return server;
  };

  const getPipelineApiUrl = (experimentId) => `${getApiServer()}/v1/experiments/${experimentId}/pipelines`;
  const getProcessingUpdateApiUrl = (experimentId) => `${getApiServer()}/v1/experiments/${experimentId}/processingConfig`;

  const startPipelineViaApi = (experimentId) => {
    const url = getPipelineApiUrl(experimentId);
    cy.log(`Starting pipeline by POSTing to ${url}`);
    cy.request('POST', url, {});
  };

  const shouldCleanProcessingConfig = () => {
    // On local, do it unless overriden
    // On a server, only if specified
    const forcedCleanupTxt = Cypress.env('CLEANUP_PROCESSING_CONFIG');
    const forcedCleanup = forcedCleanupTxt === 1 || ['1', 'true', 'on'].includes[forcedCleanupTxt?.toLowerCase()];
    return forcedCleanup || (isLocalEnv() && !forcedCleanupTxt);
  };

  const cleanProcessingConfig = (experimentId) => {
    const url = getProcessingUpdateApiUrl(experimentId);
    cy.log(`Initialising ProcessingConfig values by PUTting to ${url}`);
    cy.request('PUT', url, processingUpdate);
  };

  const startPipelineViaUI = () => {
    // Verify that the first filter is disabled by prefiltered samples, and move past it
    // cy.get('[role=alert]')
    //   .should('contain.text', 'pre-filtered');
    cy.get('[data-testid=enableFilterButton]')
      .should('not.be.enabled');
    cy.get('[data-testid=pipelineNextStep]').click();

    // Enable+disable+save changes to trigger the pipeline
    cy.get('[data-testid=enableFilterButton]').click();
    cy.get('[data-testid=enableFilterButton]').click();
    cy.get('[data-testid=runFilterButton]').click();
  };

  const testDataProcessing = (experimentId) => {
    if (shouldCleanProcessingConfig()) {
      cleanProcessingConfig(experimentId);
    } else {
      cy.log(`Not cleaning up the ProcessingConfig values (CLEANUP_PROCESSING_CONFIG=${Cypress.env('CLEANUP_PROCESSING_CONFIG')})`);
    }

    cy.visit(`/experiments/${experimentId}/data-processing`);

    const useApi = true;

    if (useApi) {
      startPipelineViaApi(experimentId);
    } else {
      startPipelineViaUI();
    }

    const numSteps = 7;
    const stepTimeOut = { timeout: SECONDS_PER_STEP * 1000 };

    // Wait for the pipeline to start.
    // Starting the pipeline can result in us getting in a skeleton state,
    // so we need a higher timeout also to get the progressbar
    cy.get('[role=progressbar]', stepTimeOut)
      .invoke(stepTimeOut, 'attr', 'aria-valuenow')
      .should('equal', '1');

    const validNextStepsRegExp = (lastKnown) => {
      const steps = [...Array(numSteps - lastKnown).keys()].map((i) => i + lastKnown + 1);
      return new RegExp(steps.join('|'));
    };
    const waitForFollowingStep = (lastKnown) => {
      cy.get('[role=progressbar]', stepTimeOut)
        .invoke(stepTimeOut, 'attr', 'aria-valuenow')
        .should('match', validNextStepsRegExp(lastKnown))
        .then((currentStepAsText) => {
          const currentStep = parseInt(currentStepAsText, 10);
          cy.get('[data-testid=pipelineNextStep]', stepTimeOut)
            .should('be.enabled')
            .click()
            .then(() => {
              if (currentStep < numSteps) {
                waitForFollowingStep(currentStep);
              }
            });
        });
    };

    waitForFollowingStep(1);
  };

  const testDataExploration = (experimentId) => {
    cy.visit(`/experiments/${experimentId}/data-exploration`);
    const dataExplorationTimeOut = { timeout: 180 * 1000 };

    // The clusters are loaded
    // Mosaic is not very testing friendly :-(
    cy.get('.mosaic-window', dataExplorationTimeOut)
      .contains('.mosaic-window', 'Data Management')
      .then(($dataManagement) => {
        // Clusters can be renamed. Or they can even not be there
        // Scratchpad is there, but may be outside of the visible area
        cy.wrap($dataManagement)
          .should('have.descendants', '[aria-label="eye"]')
          .and('have.descendants', ':contains("Scratchpad")');
      });

    // The list of gens is loaded so that we know that the worker has done something
    const maxRetryAttempts = 3;
    cy.get('.mosaic-window', dataExplorationTimeOut)
      .contains('.mosaic-window', 'Tools')
      .then(($tools) => {
        const literals = {
          waitIfWorkerRunning: 'getting your data',
          waitIfWorkerNotRunning: 'will take a few minutes',
        };
        const verifyGeneDisplayed = () => {
          cy.wrap($tools)
            .find('tr:nth-of-type(2)')
            .find('a')
            .invoke('attr', 'href')
            .should('match', /.*genecards.*/);
        };
        const waitForWaitingBannerToGoAway = (text, callBack) => {
          cy.wrap($tools, dataExplorationTimeOut)
            .should('not.contain', text)
            .then(callBack);
        };
        const clickOnRetyButton = () => {
          cy.wrap($tools)
            .contains('button', /try again/i)
            .click();
        };
        let attempts = 0;
        function checkAndRetry() {
          // synchronous queries, using jQuery
          const tryAgainButton = $tools.find(':contains("Try again")');
          const workerRunningBanner = $tools.find(`:contains("${literals.waitIfWorkerRunning}")`);
          const workerNotRunningBanner = $tools.find(`:contains("${literals.waitIfWorkerNotRunning}")`);
          if (tryAgainButton.length) {
            attempts += 1;
            if (attempts > maxRetryAttempts) {
              throw new Error(`Already attempted ${attempts - 1}. Giving up. Is there something wrong with the worker?`);
            }
            clickOnRetyButton();
            cy.wait(100).then(checkAndRetry); // eslint-disable-line cypress/no-unnecessary-waiting
          } else if (workerRunningBanner.length) {
            waitForWaitingBannerToGoAway(literals.waitIfWorkerRunning, checkAndRetry);
          } else if (workerNotRunningBanner.length) {
            waitForWaitingBannerToGoAway(literals.waitIfWorkerNotRunning, checkAndRetry);
          } else {
            verifyGeneDisplayed();
          }
        }
        checkAndRetry();
      });
  };

  EXPERIMENT_IDS.split(':').forEach((experimentId) => {
    it(`runs the pipeline and moves to data exploration (${experimentId})`, () => {
      testDataProcessing(experimentId);
      testDataExploration(experimentId);
    });
  });
});
