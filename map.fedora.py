#!/usr/bin/env python
# -*- coding: utf-8 -*-
# map fedora commons datastream requests to files for an apache_rewrite handler


import sys,os
from elementtree import ElementTree
import urllib2
from urllib import urlencode

datastream_store_base = '/home/fedora/data/datastreams'

fedora_http = 'http://localhost:8180/fedora/'
username='fedoraAdmin'
password='fedoraAdmin'

passman = urllib2.HTTPPasswordMgrWithDefaultRealm()

passman.add_password(None, fedora_http, username, password)

authhandler = urllib2.HTTPBasicAuthHandler(passman)
opener = urllib2.build_opener(authhandler)

urllib2.install_opener(opener)

while sys.stdin:
        id = sys.stdin.readline().rstrip()
        pid, dsid = id.split('/')
        content = urllib2.urlopen(fedora_http + 'objects/' + pid + '/datastreams/' + dsid + '/?format=xml').read()
        e = ElementTree.fromstring(content)
        l = e.find('.//dsLocation').text
	l = l.replace('ovmedia.wgbh.org/media', 'splat.wgbh.org:8080')
	l = l.replace('openvault.wgbh.org/media', 'splat.wgbh.org:8080')
        t = e.find('.//dsLocationType').text

        if(t == 'INTERNAL_ID'):
                print(os.popen('find ' + datastream_store_base + " -name " + l + " -print").readline().rstrip())
        else:
                print(l)

        sys.stdout.flush()
