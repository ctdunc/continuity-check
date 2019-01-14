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

com = "CREATE TABLE IF NOT EXISTS metadata (item VARCHAR(50), type VARCHAR(50));"
cursor.execute(com)
com = "INSERT INTO metadata (item, type) VALUES ('slac_expected_values', 'expected_value'), ('UC Berkeley', 'institution'), ('slac_channel_naming','channel_naming'), ('device test', 'device'), ('wiring test', 'wiring');"
cursor.execute(com)
conn.commit()
conn.close()
