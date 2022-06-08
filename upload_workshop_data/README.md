# Workshop user data upload

Script to automate upload of user data for workshops using Cypress.

### Usage

    python3 upload_data.py <input.csv>

`input.csv` is a CSV file containing the values _full_name,email,password_ **without any header row**.

The script require some Python modules to be available in the environment. All dependencies are stored in `reuirements.txt`.