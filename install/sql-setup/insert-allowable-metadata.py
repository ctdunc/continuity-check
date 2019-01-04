import MySQLdb

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

com = "CREATE TABLE IF NOT EXISTS check_metadata (Expected_Values VARCHAR(30), Institution VARCHAR(40), Wiring VARCHAR(40), Device VARCHAR(40));"
cursor.execute(com)
com = "INSERT INTO check_metadata (Expected_Values, Institution, Wiring, Device) VALUES ('slac_expected_values', 'UC Berkeley', 'sample wire', 'sample dev');"
cursor.execute(com)
conn.commit()
conn.close()
