import subprocess
import pandas as pd
import sys
import os

def upload_data(elem):
    # email="lbriciomoreno@mgh.harvard.edu"
    # password="Tmp_2022-05-03OG3B7CJI"
    env = os.environ.copy()
    email=elem.email
    password=elem.password
    if password == "Already have an account":
        print(f"Ignoring existing user")
        return

    env["CYPRESS_E2E_USERNAME"] = email
    env["CYPRESS_E2E_PASSWORD"] = password
    subprocess.check_call("npm start", shell=True, env=env, stdout=sys.stdout, stderr=subprocess.STDOUT)

def upload_to_user(i):
    # email="lbriciomoreno@mgh.harvard.edu"
    # password="Tmp_2022-05-03OG3B7CJI"
    env = os.environ.copy()
    email="alex@biomage.net"
    password="Tmp_2021_fAIFAOx"

    env["CYPRESS_E2E_USERNAME"] = email
    env["CYPRESS_E2E_PASSWORD"] = password
    env["CYPRESS_E2E_ALIAS"] = f"{i}"
    subprocess.check_call("npm start", shell=True, env=env, stdout=sys.stdout, stderr=subprocess.STDOUT)

# df = pd.read_csv('./05_03_2022_users_list.csv.out')

# for i, elem in list(df.iterrows()):
#     print(f"{i}: {elem.email}")
#     upload_data(elem)

for i in range(4, 32):
    upload_to_user(i)