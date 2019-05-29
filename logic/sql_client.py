import pymysql
import string
import random 
import datetime
from itertools import groupby


class sqlclient:
    def __init__(self, host = '', history='', naming='', expected='', data='',
            user='', pw='',  db=''):
        self.run_history = history
        self.run_data = data
        self.channel_naming = naming
        self.expected_values = expected
        self.host = host
        self.user = user
        self.pw = pw
        self.db = db
          
     
    def __connect(self):
        try:
            connection = pymysql.connect(host=self.host,
                user=self.user,
                passwd=self.pw,
                db=self.db)
            return connection
        except Exception as e:
            raise e
            

    def commit_run(self, metadata):
        connection = self.__connect()
        cursor = connection.cursor()
        
        # generate unique 10-char key for run
        chars = string.ascii_letters

        newname = lambda n, func:(
                n if not(
                    cursor.execute("SHOW TABLES LIKE \""+n+"\";")
                    )
                else func(chars)
                    )
        ten_rand = lambda c: "".join(random.choice(c) for x in range(10))
        run_key = newname(ten_rand(chars), ten_rand)

        # commit to run history table
        log_command = ("INSERT INTO "+self.run_history+" (\
                Run_key, Expected_key, Naming_key, Institution, VIB, Device, Temperature, Date, Wiring)\
                VALUES (\"{check}\", \"{ekey}\", \"{nkey}\",\"{inst}\", \
                    \"{vib}\", \"{dev}\", {temp}, \"{date}\", \"{w}\");")
        log_command=log_command.format(
                check=run_key,
                ekey=metadata['expected_key'],
                nkey=metadata['naming_key'],
                inst=metadata['institution'],
                vib=metadata['vib'],
                dev=metadata['device'],
                temp=0, #TODO: fix temperature input
                date=datetime.datetime.now().strftime('%Y-%m-%d %x'),
                w=metadata['wiring']
                )
        cursor.execute(log_command)
        connection.commit()
        connection.close()
        return run_key

    def commit_run_row(self, runkey, data):
        connection = self.__connect()
        cursor = connection.cursor()
        cmd = "INSERT INTO "+self.run_data+" (Run_key, Signal_1, Channel_1,\
                Signal_2, Channel_2, Minimum, Maximum, Measured, Unit, Pass)\
                VALUES (\"{rk}\",\"{s1}\",\"{c1}\",\"{s2}\",\"{c2}\",{mi},{ma},{me},\
                \"{u}\",{p});"
        cmd = cmd.format(
                s1=data[0],c1=data[1],s2=data[2],c2=data[3],mi=data[5],ma=data[6],
                me=data[12],u="Ohm",p=data[11],rk=runkey
                )
        cursor.execute(cmd)
        connection.commit()
        connection.close()

        return 0

    def commit_expected(self):
        connection = self.__connect()
        cursor = connection.cursor()

        connection.close()
        return 0

    def commit_naming(self):
        connection = self.__connect()
        cursor = connection.cursor()

        connection.close()   
        return 0

    def fetch_run_history(self):
        connection = self.__connect()
        cursor = connection.cursor()
        cmd = ("SELECT Date, Institution, VIB, Wiring, Device, Temperature, \
                Run_key FROM "+self.run_history+";")
        cursor.execute(cmd)
        result = cursor.fetchall()
        connection.close()       
        return result 

    def fetch_run(self,runname):
        connection = self.__connect()
        cursor = connection.cursor()
        
        cmd = ("SELECT Signal_1, Channel_1, Signal_2, Channel_2, \
                Minimum, Maximum, Measured, Unit, Pass FROM "
                +self.run_data+" WHERE Run_key=\""+runname+"\";")
        cursor.execute(cmd)
        run = cursor.fetchall()

        connection.close()
        return run
    
    def fetch_expected(self,expectedname=[], tests=None):
        connection = self.__connect()
        cursor = connection.cursor()

        cmd = ("SELECT Signal_1, Channel_1, Signal_2, Channel_2, Expected_Continuity, Minimum, Maximum, Naming_key, Expected_key FROM "
               +self.expected_values)
        if expectedname or tests:
            cmd = cmd+" WHERE ("
            if expectedname: 
                expectedtests = "\" OR Expected_key=\"".join(expectedname)
                cmd = cmd+" (Expected_key=\""+expectedtests+"\")"
                if tests:
                    cmd = cmd+" AND "+tests
            elif tests:
                cmd = cmd+tests
            cmd = cmd+")"
        cmd=cmd+";"
        cursor.execute(cmd)
        result = cursor.fetchall()
        connection.close()
        return result

    def fetch_naming(self,layoutname=[]):
        connection = self.__connect()
        cursor = connection.cursor()

        result = {}
        if layoutname:
            # gets only requested layouts and returns as dict
            for name in layoutname:
                cmd = ("SELECT Matrix_location, DB_78_pin, VIB_pin, Signal_name,\
                        Channel, Type FROM "+self.channel_naming+
                        " WHERE Naming_key=\""+name+"\";")
                cursor.execute(cmd)
                layout = cursor.fetchall()
                result[name]=layout
        else:
            # return all elements
            cmd = "SELECT Matrix_location, DB_78_pin, VIB_pin, Signal_name, \
                    Channel, Type, Naming_key FROM "+self.channel_naming+";"
            cursor.execute(cmd)
            tosort = cursor.fetchall()
            layoutname = groupby(tosort, lambda x: x[6])
            for name, layout in layoutname:
                result[name]=[i for i in layout]
        connection.close()
        return result 
    
    def fetch_run_opts(self):
        connection=self.__connect()
        cursor = connection.cursor()
        result = {}
        expected_cmd = ("SELECT DISTINCT Expected_key FROM "
                +self.expected_values+";")
        naming_cmd = ("SELECT DISTINCT Naming_key FROM "
                +self.channel_naming+";")
        etc_cmd = ("SELECT DISTINCT Institution, Wiring, Device, VIB FROM "
                +self.run_history+";")
        cursor.execute(expected_cmd)
        expected_tabs = cursor.fetchall()
        
        cursor.execute(naming_cmd)
        naming_tabs = cursor.fetchall()
        inst,wire,dev,vib= [],[],[],[]
        cursor.execute(etc_cmd)
        etc = cursor.fetchall()
        sortetc =lambda x: [x[0],x[1],x[2],x[3]]
        for i,w,d,n in sortetc(etc):
            inst.append(i)
            wire.append(w)
            dev.append(d)
            vib.append(n)


        result['expected_key']=[i for i in expected_tabs]
        result['naming_key']=[i for i in naming_tabs]
        result['institution']=inst
        result['wiring']=wire
        result['device']=dev
        result['vib']=vib
         
        return result
