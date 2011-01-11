class NewsmlController < ApplicationController
  def show
   fedora_object = params[:id]
   require 'xml/xslt'
   @xslt = XML::XSLT.new()
   @xslt.xml = open(Blacklight.fedora_config[:url] + "/get/#{fedora_object}/File").read
   @xslt.xsl = open("public/xslt/newsml2html.xsl").read 
  end

end
