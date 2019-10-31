import telnetlib

class dmm_interface:
	def __init__(self,host='192.168.5.120',silent=False):
		self.host=host
		self.silent = silent
		self.tn=telnetlib.Telnet(host)
		self.initialized = False
		self.reset()

	def reset(self):
		if self.initialized:
			return
		self.send('channel.open("allslots")')
		self.send('reset()')
		self.initialized = True
		
	def send(self,cmd,timeout=2):
		if 'reset' not in cmd:
			self.initialized = False		
		self.tn.write(cmd.strip()+'\n')
		if not self.silent:
			print('> '+cmd.strip())
		result= self.tn.read_until('\n',timeout).strip()
		if not self.silent and result != '':
			print(result)
		return result

	def measure_R(self, ch1,ch2,rng=1e7):
		self.reset()
		self.send('dmm.func="twowireohms"')
		self.send('dmm.range=%d'%rng)
		self.send('dmm.autodelay=1')
		self.send('channel.close("10911")') # backpanel
		self.send('channel.close("%s,%s")'%(ch1,ch2))
		result=self.send('print(dmm.measure())')
		self.reset()
		
		return result

if __name__ == '__main__':
	dmm = dmm_interface()
	dmm.measure_R('11189','11286')
