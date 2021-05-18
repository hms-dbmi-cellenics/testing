
# Testing documentation and tools

## Cypress smoke tests

The Cypress test tools are in the `e2e` folder. By default, Cypress will run whatever
test specifications are defined in the folder `e2e/integration`; you will see that the only
thing that this folder contains is a `.gitignore` file. This is because test files will
be generated with `npm run` scripts, so that each of the experiments that you want to
test has its own test file that includes the experimentId as part of its name. All the
spec files have the same contents, that use their repective file name to determine the
experiment to use.

Cypress tests can be executed against different base urls. That is, you should be able to
execute the tests in your local development environment, in a staging environments sandbox,
and in the production environment.

### Setup

* Try to have good `npm` autocompletion that lest you know about the available `npm run`
  scripts. If you are using Zsh
  [zsh-better-npm-completion](https://github.com/lukechilds/zsh-better-npm-completion)
  is a nice choice.
* **`npm install`**
* Copy `environments.example.yaml` to `environments.yaml` and modify it by adding the
  experiments and urls that you want to test. Please, make sure that you use experiments
  that are not being used by anyone else (i.e. take advantage of `biomage stage`'s
  capability to create experiments, or of `biomage experiment copy`).
* Execute one of this commands, according to your needs:
  * **`npm run cy:run <env name from environments.yaml>`**: runs the smoke tests for all
    the experiments that you have specified in `environments.yaml` for the
    selected environment. The tests are executed in a headless browser. When the test
    execution completes, you'll see a report and you'll have a video recording of
    the execution of each spec file, in `e2e/cypress/videos`.
  * **`npm run cy:run:chrome <env name>`**: same as above, but now using a visible chrome
    instance as the test runner.
  * **`npm run cy:open <env name>`**: open the interactive cypress test runner. This is
    what you are likely to want to use if you need to debug a failing test.

### Updating the test cases

It is probably worth reading
https://docs.cypress.io/guides/core-concepts/introduction-to-cypress
before trying to do any modification to the tests.
