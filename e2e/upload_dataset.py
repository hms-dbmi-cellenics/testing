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

df = pd.read_csv('./05_03_2022_users_list.csv.out')

for i, elem in list(df.iterrows()):
    print(f"{i}: {elem.email}")
    upload_data(elem)
#    p = multiprocessing.Pool(4)

#     # map list to target function
#     result = p.map(square, mylist)