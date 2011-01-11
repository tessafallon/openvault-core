from javax.servlet.http import HttpServlet
from subprocess import *

def get_metadata(f):
	return Popen(' '.join(['wget -qO -', f, '|', 'exiftool', '-fast', '-']), shell=True, stdout=PIPE).communicate()[0]

def local_file_or_url(url):
	return url

class Metadata (HttpServlet):
	def doGet(self, request, response):
		self.doPost(request, response)

	def doPost(self, request, response):
		toClient = response.getWriter()
		response.setContentType('text/plain')
		url = request.getParameterValues('url')[0]
		
		toClient.print(get_metadata(local_file_or_url(url)))
