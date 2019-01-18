import telnetlib

class dmm_interface:

    def __init__(self,host='192.168.5.120'):
       self.host = host

       self.tn=telnetlib.Telnet(host)
       self.tn.write("load_functions()\n".encode('ascii'))         

    def __measure(self):
        measurement = self.tn.read_until(("Ohm").encode('ascii'))
        measurement = measurement.split()
        measurement = float(measurement[0])
        
        return measurement

    def test_individual(self, sig1, sig2):
        execute = ("resistance_test(\""+sig1+"\""+sig2+"\")\n").encode('ascii')
        self.tn.write(execute)
        result = self.__measure()
        return result 


    def test_parallel(self, sig1, sig2_list):
        sig2_str = "\""
        for s in sig2_list:
            sig2_str+=s+"\",\""
        sig2_str = sig2_str[:-2]
        execute = ("open_test(\""+sig1+"\",{"+sig2_str+")\n").encode('ascii')
        self.tn.write(execute)
        result = self.__measure()
        return result
