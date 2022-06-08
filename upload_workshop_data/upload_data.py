import subprocess
import pandas as pd
from pathlib import Path
import sys
import os

ADMIN_EMAIL="alex@biomage.net"
ADMIN_PASSORD="Tmp_2021_fAIFAOx"

def upload_data(email, password):
    env = os.environ.copy()
    if password == "Already have an account":
        print(f"Ignoring existing user")
        return

    env["CYPRESS_E2E_USERNAME"] = email
    env["CYPRESS_E2E_PASSWORD"] = password
    subprocess.check_call("npm start --prefix=../e2e",  shell=True, env=env, stdout=sys.stdout, stderr=subprocess.STDOUT)

def upload_to_user(i, email, password):
    env = os.environ.copy()

    env["CYPRESS_E2E_USERNAME"] = email
    env["CYPRESS_E2E_PASSWORD"] = password
    env["CYPRESS_E2E_ALIAS"] = f"{i}"
    subprocess.check_call("npm start --prefix=../e2e", shell=True, env=env, stdout=sys.stdout, stderr=subprocess.STDOUT)

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
        # If user already has an account, the password field will not contain a password
        # In this case, upload users's data to an admin account
        if "have an account" in elem.password:
            print(f"{i}: User {elem.email} have an account, uploading data to user {ADMIN_EMAIL}")
            upload_to_user(i, ADMIN_EMAIL, ADMIN_PASSORD)
            continue

        print(f"{i}: Inserting data for {elem.email}")
        upload_data(elem.email, elem.password)
