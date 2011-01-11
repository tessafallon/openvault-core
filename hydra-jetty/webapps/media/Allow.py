from javax.servlet.http import HttpServlet
from subprocess import call

class Allow (HttpServlet):
	def doGet(self, request, response):
		self.doPost(request, response)

	def doPost(self, request, response):
		toClient = response.getWriter()
		response.setContentType('text/plain')
		toClient.print(call(['chmod a+w -R /wgbh/http/openvault2/solr/data'],shell=True))
