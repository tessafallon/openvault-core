from javax.servlet.http import HttpServlet
from subprocess import *

class Media (HttpServlet):
	def doGet(self, request, response):
		self.doPost(request, response)

	def doPost(self, request, response):
		toClient = response.getWriter()
		response.setContentType('text/plain')
	#	response.setContentType('application/fedora-redirect')
		url = request.getParameterValues('url')[0]
	#	response.sendRedirect('http://google.com')
		toClient.print(url)	
