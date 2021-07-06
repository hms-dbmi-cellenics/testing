
# Testing documentation and tools

## End-to-end testing

End-to-end testing tools are found in the `e2e/` folder. There is currently
a simple Cypress smoke test suite to test basic UI functionality.

### Local setup

Cypress can automatically run a basic smoke test on the UI. To do this, you must
first install all required dependencies:

  cd e2e/
  npm install

### Local development

To develop tests locally, you first need to open the VS Code workspace:

  code e2e.code-workspace

Then you can run the GUI of the test runner:

  K8S_ENV=production npm run dev

The Cypress application should open and you can select which tests to run.
Any updates to the test file causes the test to reload, providing you with
a hot-reload functionality to iteratively improve your tests.

### Running in production

The tests can be run using GitHub Actions. Navigate to the
[actions](https://github.com/biomage-ltd/testing/actions)
under the repository. You can launch the tests manually for
each environment.

A nightly test on the production environment only is also run
at midnight every day automatically.
