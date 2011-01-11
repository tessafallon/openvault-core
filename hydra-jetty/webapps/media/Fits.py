#!/usr/bin/env jython

# This is a Jython Servlet wrapper for FITS <http://code.google.com/p/fits/>
#
# INSTALL:
# Set the FITS_HOME variable to the location of the FITS package  
#
# Some JARs may need to be moved into the endorsed folder (./common/endorsed)
# like jaxon, jdom, saxon, saxpath, and xerces.
#
# http://[...]/Fits.py?url={URL TO FILE}
#
# Author:
# Chris Beer <chris_beer@wgbh.org>
#
# 0.0.1a
#

import sys
import os


import glob
import java.io

from javax.servlet.http import HttpServlet

from tempfile import NamedTemporaryFile
from subprocess import *


def setClassPath(FITS_HOME):
        classPaths = glob.glob(FITS_HOME + "lib/*.jar") + glob.glob(FITS_HOME + "lib/*/*.jar") + glob.glob(FITS_HOME + "lib/*/*/*.jar") + glob.glob('/usr/share/java/xerces*')

        for classPath in classPaths:
                sys.path.append(classPath)

def getLocalFile(url, f):
        Popen(' '.join(['wget -qO ', f, url]), shell=True, stdout=PIPE).communicate()[0]

class Fits (HttpServlet):
        def doGet(self, request, response):
                self.doPost (request, response)

        def doPost(self, request, response):
                FITS_HOME = "/usr/share/tomcat5.5/webapps/media/WEB-INF/lib/fits/"

                # retrieve the file to the local filesystem.. future version of
                # FITS may make this unnecessary
                url = request.getParameterValues('url')[0]
                outfile = NamedTemporaryFile()
                getLocalFile(url, outfile.name)
                inputFile = java.io.File(outfile.name)

                # Init the java packages
                setClassPath(FITS_HOME)
                from edu.harvard.hul.ois.fits import Fits
                from org.jdom.output import Format
                from org.jdom.output import XMLOutputter
                f = Fits(FITS_HOME)
                res = f.examine(inputFile)
                doc = res.getFitsXml()

                # write the FITS XML response
                toClient = response.getWriter()
                response.setContentType("text/xml")
                o = XMLOutputter(Format.getPrettyFormat())
                o.output(doc, toClient)

                # cleanup
                outfile.close()

