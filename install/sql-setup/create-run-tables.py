import MySQLdb
import os
import re

host = 'localhost'
user = 'cdms'
pw = 'cdms'
db = 'continuity_check'


conn = MySQLdb.connect(
    user=user,
    passwd=pw,
    host=host,
    db=db)
cursor=conn.cursor()

create_log = """ CREATE TABLE IF NOT EXISTS run_history (Run_key VARCHAR(255),
    Naming_key VARCHAR(255), Expected_key VARCHAR(255), VIB VARCHAR(255),
    Device VARCHAR(255), Wiring VARCHAR(255), Temperature FLOAT(8), 
    Date DATETIME
    """
create_hist = """
    CREATE TABLE IF NOT EXISTS run_data (Run_key VARCHAR(255),
    Signal_1 VARCHAR(255), Channel_1 INT, Signal_2 VARCHAR(255), Channel_2 INT,
    Minimum FLOAT(8), Maximum FLOAT(8), Measured FLOAT(8), Pass BOOL, 
    Unit VARCHAR(255));
    """

cursor.execute(create_log)
cursor.execute(create_hist)
conn.close()

