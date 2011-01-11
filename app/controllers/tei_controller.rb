class TeiController < ApplicationController
  def show
   fedora_object = params[:id]
   require 'xml/xslt'
   @xslt = XML::XSLT.new()
   @xslt.xml = open(Blacklight.fedora_config[:url] + "/get/#{fedora_object}/File").read
   @xslt.xsl = open("public/xslt/tei2timedtranscript.xsl").read 
  end
end
