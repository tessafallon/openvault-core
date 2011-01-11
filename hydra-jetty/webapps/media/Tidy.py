from javax.servlet.http import HttpServlet
from BeautifulSoup import BeautifulSoup
from BeautifulSoup import BeautifulStoneSoup

from subprocess import *
import urllib

class Tidy (HttpServlet):
	def doGet(self, request, response):
		self.doPost(request, response)

	def doPost(self, request, response):
		toClient = response.getWriter()
		response.setContentType('text/html')
		url = request.getParameterValues('url')[0]

		html = urllib.urlopen(url).read()
		soup = BeautifulSoup(html,convertEntities=BeautifulStoneSoup.HTML_ENTITIES)
		toClient.print(soup.prettify())
		
