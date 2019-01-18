import MySQLdb
import numpy as np
import pandas as pd
import os
import re

dir_path = os.getcwd()
host = 'localhost'
user = 'cdms'
pw = 'cdms'
db = 'continuity_check'

phonon = ["SQ","SQ_RTN", "SQF", "SQF_RTN", "TES_BIAS"]
charge = []
data = pd.read_excel(dir_path+'/Continuity_PCB.xlsx')
conn = MySQLdb.connect(
    user=user,
    passwd=pw,
    host=host,
    db=db)
cursor=conn.cursor()

inect = """
CREATE TABLE IF NOT EXISTS channel_naming (Matrix_location VARCHAR(20), DB_78_pin VARCHAR(20), VIB_pin VARCHAR(20), Signal_name VARCHAR(255), Channel INT, Type VARCHAR(255), Naming_key VARCHAR(255));
"""
cursor.execute(inect)

endint = re.compile('\d')
for index,row in data.iterrows():
    str_input = """INSERT INTO channel_naming
    (Matrix_location, DB_78_pin, VIB_pin, Signal_name, Channel,Type, Naming_Key)
    VALUES
        ("{matr}", "{dpin}", "{vibpin}", "{sign}", "{chan}", "{t}", "sample_naming");
    """


    sig, mat, dpin, vpin = row["Signal name"], row["Matrix location"], row["DB 78 pin"], row["VIB pin"]
    try:
        s =  endint.search(sig).span()
        beg, end = s[0], s[1]
        num, sig = sig[beg:], sig[:beg-1]
    except:
        pass
        num = -1
    typ='x' # using 'typ' because 'type' is a reserved keyword and I don't have a thesaurus.
    if sig.startswith("LED"):
        typ = "LED"
    if sig in phonon:
        typ = "PHONON"
    if sig in charge:
        typ = "CHARGE"

    execute = str_input.format(matr=mat,dpin=dpin,sign=sig,chan=num,vibpin=vpin,t=typ)
    print(execute)
    cursor.execute(execute)
conn.commit()
conn.close()


