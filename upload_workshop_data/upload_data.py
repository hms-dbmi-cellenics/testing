import subprocess
import pandas as pd
from pathlib import Path
import sys
import os

ADMIN_EMAIL="alex@biomage.net"
ADMIN_PASSORD="Tmp_2021_fAIFAOx"

def copy_workshop_data(email, password):
    env = os.environ.copy()

    env["CYPRESS_E2E_USERNAME"] = email
    env["CYPRESS_E2E_PASSWORD"] = password

    if password == "Already have an account":
        return

    subprocess.check_call(
        "npm start --prefix=../e2e --spec ./cypress/integration/ui-smoke/copy-workshop-data.spec.js ",
        shell=True,
        env=env,
        stdout=sys.stdout,
        stderr=subprocess.STDOUT
    )

if __name__ == "__main__":

    if(len(sys.argv) == 1):
        print("USAGE : python3 upload_dataset.py <usernames.csv>")
        exit()

    input_file_path = Path(sys.argv[1])
    if not input_file_path.exists():
        print("File does not exist")
        exit(1)

    df = pd.read_csv(input_file_path, names=["full_name", "email", "password"])

    print(len(df))

    for i, elem in list(df.iterrows()):
        print(f"{i}: Inserting data for {elem.email}")
        copy_workshop_data(elem.email, elem.password)
