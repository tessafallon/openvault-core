from javax.servlet.http import HttpServlet
from elementtree import ElementTree
import urllib2
import socket
from urllib import urlencode

datastream_store_base = '/wgbh/http/openvault/fedora/data/datastreams'

fedora_http = 'http://localhost:8180/fedora/'
username='fedoraAdmin'
password='fedoraFedora'

timeout = 2
socket.setdefaulttimeout(timeout)

passman = urllib2.HTTPPasswordMgrWithDefaultRealm()

passman.add_password(None, fedora_http, username, password)

authhandler = urllib2.HTTPBasicAuthHandler(passman)
opener = urllib2.build_opener(authhandler)

urllib2.install_opener(opener)

class Thumbnail(HttpServlet):
	def doGet(self, request, response):
		self.doPost(request, response)

	def getContent(self, url):
		try:
			x = urllib2.urlopen(url)
			s = x.read()
			x.close()
			return s
		except urllib2.HTTPError, e:
			e.close()
			raise e

	def doPID(self, pid, size):
		try:
			content = self.getContent('http://localhost:8180/fedora/objects/' + pid + '/datastreams?format=xml')
			e = ElementTree.fromstring(content)
			
			for i in e.findall('.//datastream[@dsid="__tn_' + size + '"]'):	
				try:
					return self.getContent('http://localhost:8180/fedora/get/' + pid + '/__tn_' + size)
				except urllib2.HTTPError:
					print ""
		
			for i in e.findall('.//datastream[@dsid="' + size.capitalize() + '"]'):
				try:
					return self.getContent('http://localhost:8180/fedora/get/' + pid + '/' + size.capitalize())
				except urllib2.HTTPError:
					print ""
	
			for i in e.findall('.//datastream[@dsid="Thumbnail"]'):
				try:
					return self.getContent('http://localhost:8180/fedora/get/' + pid + '/Thumbnail')
				except urllib2.HTTPError:
					print ""
		except urllib2.HTTPError:
			print ""
		return None

	def doPost(self, request, response):
		toClient = response.getWriter()
		response.setContentType('image/jpeg')
		#response.setContentType('text/plain')
		pid = request.getParameterValues('pid')[0]
		size = request.getParameterValues('size')[0] # thumbnail, small, medium, full, essence
		try: 
			content = self.getContent('http://localhost:8180/fedora/objects/' + pid + '/datastreams?format=xml')
			e = ElementTree.fromstring(content)
			
			for i in e.findall('.//datastream[@dsid="__tn_' + size + '"]'):
				toClient.print(self.getContent('http://localhost:8180/fedora/get/' + pid + '/__tn_' + size))	
				return
	
		
			for i in e.findall('.//datastream[@dsid="Thumbnail"]'):
				toClient.print(self.getContent('http://localhost:8180/fedora/get/' + pid + '/Thumbnail'))	
				return
		except urllib2.HTTPError:
			print ""
		
		
		data = dict(dt="on", format="CSV", lang="itql", limit=1000, type="tuples", query='select $pid from <#ri> where (<info:fedora/' + pid + '> <fedora-rels-ext:hasThumbnail> $pid) or ($pid <fedora-rels-ext:isThumbnailOf> <info:fedora/' + pid + '>)')
		content = self.getContent('http://localhost:8180/fedora/risearch?%s' % urlencode(data))
		if(len(content.split("\n")) > 2):
			for fqid in content.split("\n"):	
				if(fqid == '"pid"' or len(fqid) == 0):
					continue
				tn_pid = fqid.split('/').pop(1)
				str = self.doPID(tn_pid, size)
				if(str):
					toClient.print(str)
					return
		
		data = dict(dt="on", format="CSV", lang="itql", limit=1000, type="tuples", query='select $pid from <#ri> where $pid <fedora-rels-ext:isPartOf> <info:fedora/' + pid + '>')
		
		content = self.getContent('http://localhost:8180/fedora/risearch?%s' % urlencode(data))
		
		if(len(content.split("\n")) > 2):
			for fqid in content.split("\n"):	
				if(fqid == '"pid"' or len(fqid) == 0):
					continue
				tn_pid = fqid.split('/').pop(1)
				str = self.doPID(tn_pid, size)
				if(str):
					toClient.print(str)
					return

		data = dict(dt="on", format="CSV", lang="itql", limit=1000, type="tuples", query='select $pid from <#ri> where (<info:fedora/' + pid + '> <fedora-rels-ext:isPartOf> $pid) or  ($pid<fedora-rels-ext:hasPart> <info:fedora/' + pid + '>)')
		content = self.getContent('http://localhost:8180/fedora/risearch?%s' % urlencode(data))

		if(len(content.split("\n")) > 2):
			for fqid in content.split("\n"):	
				if(fqid == '"pid"' or len(fqid) == 0):
					continue
				tn_pid = fqid.split('/').pop(1)

				str = self.doPID(tn_pid, size)
				if(str):
					toClient.print(str)
					return
					
				try:
		                    #    data = dict(dt="on", format="CSV", lang="itql", limit=1000, type="tuples", query='select $pid from <#ri> where (<info:fedora/' + pid + '> <fedora-rels-ext:isMemberOfCollection> $pid)')
		                        data = dict(dt="on", format="CSV", lang="sparql", limit=1000, type="tuples", query='PREFIX fedora-model: <info:fedora/fedora-system:def/model#> PREFIX dc: <http://purl.org/dc/elements/1.1/> PREFIX fedora-rels-ext: <info:fedora/fedora-system:def/relations-external#> SELECT ?pid WHERE {{ { ?pid fedora-rels-ext:hasMember <info:fedora/' + tn_pid + '> } UNION { <info:fedora/' + tn_pid + '>  fedora-rels-ext:isMemberOfCollection ?pid } } UNION { <info:fedora/' + tn_pid + '> fedora-rels-ext:isMemberOfCollection ?p. ?p fedora-rels-ext:isMemberOfCollection ?pid. } UNION { <info:fedora/' + tn_pid + '> fedora-rels-ext:isMemberOfCollection ?p1. ?p1 fedora-rels-ext:isMemberOfCollection ?p. ?p fedora-rels-ext:isMemberOfCollection ?pid. } }') 
		                                
		                        content = self.getContent('http://localhost:8180/fedora/risearch?%s' % urlencode(data))
		                                
		                        if(len(content.split("\n")) > 2):
		                                for fqid in content.split("\n"):
		                                        if(fqid == '"pid"' or len(fqid) == 0 or len(fqid.split('/')) < 2):
		                                                continue
		                                        parent_pid = fqid.split('/').pop(1)
		                                        if parent_pid == pid:
		                                                continue
		                                        #toClient.print(self.getContent('http://localhost:8180/fedora/get/' + parent_pid + '/sdef:THUMBNAIL/' + size))
							str = self.doPID(parent_pid, size)
							if(str):
								toClient.print(str)
		                                        	return
		                                
		                except urllib2.HTTPError:
		                        print ""		
		try:
                    #    data = dict(dt="on", format="CSV", lang="itql", limit=1000, type="tuples", query='select $pid from <#ri> where (<info:fedora/' + pid + '> <fedora-rels-ext:isMemberOfCollection> $pid)')
                        data = dict(dt="on", format="CSV", lang="sparql", limit=1000, type="tuples", query='PREFIX fedora-model: <info:fedora/fedora-system:def/model#> PREFIX dc: <http://purl.org/dc/elements/1.1/> PREFIX fedora-rels-ext: <info:fedora/fedora-system:def/relations-external#> SELECT ?pid WHERE {{ { ?pid fedora-rels-ext:hasMember <info:fedora/' + pid + '> } UNION { <info:fedora/' + pid + '>  fedora-rels-ext:isMemberOfCollection ?pid } } UNION { <info:fedora/' + pid + '> fedora-rels-ext:isMemberOfCollection ?p. ?p fedora-rels-ext:isMemberOfCollection ?pid. } UNION { <info:fedora/' + pid + '> fedora-rels-ext:isMemberOfCollection ?p1. ?p1 fedora-rels-ext:isMemberOfCollection ?p. ?p fedora-rels-ext:isMemberOfCollection ?pid. } }') 
                                
                        content = self.getContent('http://localhost:8180/fedora/risearch?%s' % urlencode(data))
                                
                        if(len(content.split("\n")) > 2):
                                for fqid in content.split("\n"):
                                        if(fqid == '"pid"' or len(fqid) == 0 or len(fqid.split('/')) < 2):
                                                continue
                                        parent_pid = fqid.split('/').pop(1)
                                        if parent_pid == pid:
                                                continue
                                        #toClient.print(self.getContent('http://localhost:8180/fedora/get/' + parent_pid + '/sdef:THUMBNAIL/' + size))
					str = self.doPID(parent_pid, size)
					if(str):
						toClient.print(str)
                                        	return
                                
                except urllib2.HTTPError:
                        print ""		

		#default?
	
		if size in ['preview', 'thumbnail']:
			toClient.print(self.getContent('http://localhost:8180/images/no-image-available_thumb.jpg'))	
			return

		if size in ['medium', 'full', 'essence']:
			toClient.print(self.getContent('http://localhost:8180/images/no-image-available.jpg'))	
			return
		
		#toClient.print(grab_frame(local_file_or_url(url), t))
