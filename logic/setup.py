import MySQLdb

conn=MySQLdb.connect(user='cdms',passwd='cdms', db='continuity_check', host='localhost')
cur = conn.cursor()


