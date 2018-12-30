import MySQLdb
import string
import random
import datetime

# define convenient and repeated commands
tabne = 'CREATE TABLE IF NOT EXISTS ' # tabne short for TABle Not Exists

class sqlclient:
    def __init__(self, host, db, user, pw, history, naming, expected):
        self.run_history = history
        self.channel_naming = naming
        self.expected_values = expected
        self.host = host
        self.user = user
        self.pw = pw
        self.db = db
        # make sure run history exists (channel_naming and expected_vals
        # require more in-depth setup)

        conn = self.__connect()
        cursor = conn.cursor()
        
        command = (tabne + history +' (Date DATETIME, \
                Institution VARCHAR(20), \
                Vib VARCHAR(10), \
                Device VARCHAR(10), \
                Wiring VARCHAR(10), \
                Device VARCHAR(20), \
                Temperature FLOAT(8), \
                Validator VARCHAR(10), \
                CheckName VARCHAR(10));'
                )

        cursor.execute(command)
        conn.close()

    def __connect(self):
        try:
            connection = MySQLdb.connect(host=self.host,
                user=self.user,
                passwd=self.pw,
                db=self.db)
            return connection
        except Exception as e:
            return ('Error in sqlclient.connect! '+str(e))

    def get_signal_list(self):
        conn = self.__connect()
        cursor = conn.cursor()
        command = "SELECT DISTINCT Signal_name, Type FROM "+self.channel_naming;
        cursor.execute(command)
        res = cursor.fetchall()

        conn.close()
        return res

    def get_channel_layout(self):
        conn =  self.__connect()
        cursor = conn.cursor()
        command = "SELECT DISTINCT Type, Channel, Signal_name FROM " +self.channel_naming+";"
        cursor.execute(command)
        types = cursor.fetchall()

        conn.close()
        return types

    def get_history(self):
        conn = self.__connect()
        cursor = conn.cursor()

        cmd = """ SELECT Date,
            Institution,
            Vib,
            Wiring,
            Device,
            Temperature,
            Validator,
            CheckName FROM 
            """
        exe = cmd + self.run_history
        cursor.execute(exe)

        data = cursor.fetchall()
        conn.close()
        return data

    def get_run(self, run): 
        conn = self.__connect()
        cursor = conn.cursor()
        cmd = """ SELECT
            Signal_1,
            Signal_2,
            Minimum,
            Maximum,
            Measured,
            Unit,
            Pass FROM 
            """
        ex = cmd + run
        cursor.execute(ex)

        data = cursor.fetchall()
        conn.close()
        return(data)
        
    def get_expected_value(self, tests=''):
        conn = self.__connect()
        cursor = conn.cursor()
        cmd = """ SELECT
                Signal_1,
                Channel_1,
                Signal_2,
                Channel_2,
                Expected_Continuity,
                Minimum,
                Maximum FROM 
                """
        ex = cmd + self.expected_values+tests+';'
        cursor.execute(ex)

        data = cursor.fetchall()
        conn.close()
        return data
                
    def get_channel_naming(self, tests):
        conn = self.__connect()
        cursor = conn.cursor()

        cmd = "\
            SELECT Matrix_location, \
            DB_78_pin, \
            VIB_pin, \
            Signal_name, \
            Channel, \
            Type \
            FROM \
            " + self.channel_naming \
            + tests+";" 
        cursor.execute(cmd)
        data=cursor.fetchall()
        conn.close()
        return data       

    def write_run(self,
            data,
            institution,
            vib,
            wiring,
            device,
            temp,
            validation_table):
        conn = self.__connect()
        cursor = conn.cursor()
        
        # Generate unique table ID
        chars = string.ascii_letters
        gname = lambda n, func:(
                   n if not (
                       cursor.execute("SHOW TABLES LIKE "+n)
                       )
                   else func(chars)
                )
        n = lambda c: "".join((random.choice(c) for x in range(10)))
        name = gname(n(chars), n)
        
        # create table
        cmd = """
            CREATE TABLE IF NOT EXISTS
            {name} (
            Signal_1 VARCHAR(20),
            Signal_2 VARCHAR(20),
            Minimum FLOAT(8),
            Maximum FLOAT(8),
            Measured FLOAT(8),
            Unit VARCHAR(10),
            Pass INT);
        """
        cmd = cmd.format(name=name)
        cursor.execute(cmd)

        # log table creation
        cmd = ("INSERT INTO "+self.run_history+" ( \
            CheckName, \
            Institution, \
            Vib, \
            Device, \
            Temperature, \
            Validator, \
            Date) \
            VALUES ( \
            \"{check}\", \
            \"{inst}\", \
            \"{vib}\", \
            \"{dev}\", \
            \"{temp}\", \
            \"{val}\", \
            \"{date}\" \
                );").format(check=name,
                        inst=institution,
                        vib=vib,
                        dev=device,
                        temp=temp,
                        val=validation_table,
                        date=datetime.datetime.now().strftime('%Y-%m-%d %x'))
        cursor.execute(cmd)
        
        cmd = """
            INSERT INTO
                {table} (
                Signal_1,
                Signal_2,
                Minimum,
                Maximum,
                Measured,
                Unit,
                Pass) 
            VALUES (
                {s1},
                {s2},
                {mi},
                {ma},
                {me},
                {u},
                {p});
                """
        for data in data:
            ex = cmd.format(table=name,
                    s1=data['Signal 1'],
                    s2=data['Signal 2'],
                    mi=data['Minimum'],
                    ma=data['Maximum'],
                    me=data['Measured'],
                    u=data['Unit'],
                    p=data['Pass'])
            cursor.execute(ex)
        conn.commit()
        conn.close()
        return 0
