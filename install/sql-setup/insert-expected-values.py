import numpy as np
import pandas as pd
import MySQLdb
import re

conn = MySQLdb.connect(user='cdms', passwd='cdms', host='localhost', database='continuity_check')
cursor = conn.cursor()
expected_file = './expected_result'
expected_result = np.genfromtxt(
        expected_file,
        names=True,
        dtype=[
            ('Signal_1','|U20'),
            ('Signal_2','|U20'),
            ('Expected_Continuity','|U8'),
            ('min',float),
            ('max',float)
            ]
        )
ex = """ CREATE TABLE IF NOT EXISTS
    expected_values (Signal_1 VARCHAR(255), Channel_1 INT,  Signal_2 VARCHAR(255),Channel_2 INT, Expected_Continuity BOOL, Minimum FLOAT(8), Maximum FLOAT(8), Naming_key VARCHAR(255), Expected_key VARCHAR(255));"""
cursor.execute(ex)
endint = re.compile('\d')
def n_ret(r):
    try:
        s =  endint.search(r).span()
        beg, end = s[0], s[1]
        num, r = r[beg:], r[:beg-1]
    except:
        num = -1
        pass
    return r,num
    

for r in expected_result:
    format_str="""INSERT INTO expected_values (Signal_1, Channel_1, Signal_2, Channel_2, Expected_Continuity, Minimum, Maximum, Naming_key, Expected_key)
        VALUES ("{sig1}","{ch1}","{sig2}","{ch2}","{exp_cont}","{min}","{max}","sample_naming","sample_expected");"""
    if r[2].startswith('Dis'):
        r[2]=0
    else: 
        r[2]=1
    s1,c1= n_ret(r[0])
    s2,c2= n_ret(r[1])

    
    sql_command = format_str.format(sig1=s1,ch1=c1,sig2=s2,ch2=c2,exp_cont=r[2],min=r[3],max=r[4])
    cursor.execute(sql_command)

conn.commit()
conn.close()
