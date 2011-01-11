from javax.servlet.http import HttpServlet
from subprocess import call
from tempfile import NamedTemporaryFile

def grab_frame(f, t):
	outfile = NamedTemporaryFile(suffix=".jpg")
	call(['ffmpeg ' + ' '.join(['-i', f, '-ss', t, '-vframes', '1', '-f', 'image2', outfile.name])], shell=True)
	return open(outfile.name).read()

def local_file_or_url(url):
	return url

class Grab (HttpServlet):
	def doGet(self, request, response):
		self.doPost(request, response)

	def doPost(self, request, response):
		toClient = response.getWriter()
		response.setContentType('image/jpeg')
		#response.setContentType('text/plain')
		url = request.getParameterValues('url')[0]
		
		t = request.getParameterValues('t')[0]
		toClient.print(grab_frame(local_file_or_url(url), t))
