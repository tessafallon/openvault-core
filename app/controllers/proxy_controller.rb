require 'cgi'

class ProxyController < ApplicationController
  
  # get search results from the solr index
  def index
    @text = open(params[:url]).read
    respond_to do |format|
      format.html    { render :layout => false } 
    end
  end
  def lcsh
    @text = open('http://id.loc.gov/authorities/suggest/?q=' + CGI::escape(params[:q])).read
    respond_to do |format|
      format.html    { render :layout => false } 
      format.xml    { render :layout => false } 
    end
  end
  def redirect
    render :status => 404 if params[:id].nil?
    url = Shorturl.find_by_source params[:id].downcase
    redirect_to url.destination
  end
end
