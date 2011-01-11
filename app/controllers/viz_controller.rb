class VizController < ApplicationController
  include Blacklight::SolrHelper
  include BlacklightMlt::ViewHelperOverride
  include BlacklightMlt::ControllerOverride
  
  #before_filter :search_session, :history_session
  #before_filter :delete_or_assign_search_session_params,  :only=>:index
  #after_filter :set_additional_search_session_values, :only=>:index
  
  # Whenever an action raises SolrHelper::InvalidSolrID, this block gets executed.
  # Hint: the SolrHelper #get_solr_response_for_doc_id method raises this error,
  # which is used in the #show action here.
  rescue_from InvalidSolrID, :with => lambda {
    # when a request for /catalog/BAD_SOLR_ID is made, this method is executed...
    flash[:notice] = "Sorry, you seem to have encountered an error."
    redirect_to catalog_index_path
  }
  
  # When RSolr::RequestError is raised, this block is executed.
  # The index action will more than likely throw this one.
  # Example, when the standard query parser is used, and a user submits a "bad" query.
  rescue_from RSolr::RequestError, :with => lambda {
    # when solr (RSolr) throws an error (RSolr::RequestError), this method is executed.
    flash[:notice] = "Sorry, I don't understand your search."
    redirect_to catalog_index_path
  }
  def show
    @response, @document = get_solr_response_for_doc_id
    @similar = get_more_like_this_for_doc_id nil, {'mlt.count' => 30} 
    @field = params[:field] || 'topic'
    @records = {}
    @similar.each do |record| 
      record[@field].uniq.each do |p| 
	next if p.blank?
	@records[p] = [] if @records[p].nil?
	@records[p] <<  record 
      end unless record[@field].blank?
    end
    
    respond_to do |format|
      format.html { render :layout => false }
      format.xml { render :text => @records.to_yaml }
    end
  end
end
