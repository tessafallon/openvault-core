class HomeController < ApplicationController

  # get search results from the solr index
  def index
    respond_to do |format|
      format.html
    end
  end
end

