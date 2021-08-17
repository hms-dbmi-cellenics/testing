
# Testing documentation and tools

## End-to-end testing

End-to-end testing tools are found in the `e2e/` folder. There is currently
a simple Cypress smoke test suite to test basic UI functionality.

### Local setup

Cypress can automatically run a basic smoke test on the UI. To do this, you must
first install all required dependencies:

```
cd e2e/
npm install
```

### Local development
You need to set two environment variables for authentication:

* `CYPRESS_E2E_USERNAME` - your email for logging in the platform
* `CYPRESS_E2E_PASSWORD` - your password for logging in the platform


Then you can run the GUI of the test runner:

`make test`

The Cypress application should open and you can select which tests to run. By default cypress runs the tests locally so you need to run the develop environment.
Any updates to the test file causes the test to reload, providing you with
a hot-reload functionality to iteratively improve your tests.

### Running in production

The tests can be run using GitHub Actions. Navigate to the
[actions](https://github.com/biomage-ltd/testing/actions)
under the repository. You can launch the tests manually for
each environment.

A nightly test on the production environment only is also run
at midnight every day automatically.

### Running in staging

Experiments from production are copied to staging to carry out integration tests on staging. These experiments are defined in `config.yaml`. These experiments have to be uploaded and run properly before they can be copied.