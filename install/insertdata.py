import pymysql as MySQLdb
import os
import re
import numpy as np
import pandas as pd

def insertdata(us,pw,db):
    conn = MySQLdb.connect(
            user=us,
            passwd=pw,
            host='localhost',
            db=db)
    cursor = conn.cursor()
    
    #INSERT RUN LOG
    create_log = """ CREATE TABLE IF NOT EXISTS run_history (Run_key VARCHAR(255),
        Naming_key VARCHAR(255), Expected_key VARCHAR(255), VIB VARCHAR(255),
        Device VARCHAR(255), Wiring VARCHAR(255), Temperature FLOAT(8), 
        Date DATETIME);
        """
    cursor.execute(create_log)

    create_hist = """
        CREATE TABLE IF NOT EXISTS run_data (Run_key VARCHAR(255),
        Signal_1 VARCHAR(255), Channel_1 INT, Signal_2 VARCHAR(255), Channel_2 INT,
        Minimum FLOAT(8), Maximum FLOAT(8), Measured FLOAT(8), Pass BOOL, 
        Unit VARCHAR(255));
        """
    cursor.execute(create_hist)

    create_meta = "CREATE TABLE IF NOT EXISTS metadata (item VARCHAR(50), type VARCHAR(50));"
    cursor.execute(create_meta)
    
    # INSERT METADATA
    ins_meta= "INSERT INTO metadata (item, type) VALUES ('slac_expected_values', 'expected_value'), ('UC Berkeley', 'institution'), ('slac_channel_naming','channel_naming'), ('device test', 'device'), ('wiring test', 'wiring');"
    cursor.execute(ins_meta)

    # INSERT CHANNEL DICT FROM CSV w/ HARDCODED TYPES

    dir_path = os.getcwd()
    phonon = ["SQ","SQ_RTN", "SQF", "SQF_RTN", "TES_BIAS"]
    charge = []

    data = pd.read_excel(dir_path+'/install/sql-setup/Continuity_PCB.xlsx')

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

    # INSERT EXPECTED VALUES

    expected_file = './install/sql-setup/expected_result'
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

