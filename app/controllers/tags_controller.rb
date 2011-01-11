class TagsController < ApplicationController
  include Blacklight::SolrHelper
  
  # see vendor/plugins/resource_controller/
  resource_controller
  
   # acts_as_taggable_on_steroids plugin
  helper TagsHelper
  
  before_filter :verify_user, :except => :index
  
  # overrides the ResourceController collection method
  # see vendor/plugins/resource_controller/
  def collection
  end
  
  update.wants.html { redirect_to :back }
  
  create.wants.js { render :template => "create.rjs" } 
  create.wants.html { redirect_to :back }
  def create
    @response, @document = get_solr_response_for_doc_id params[:tag][:document_id]
    params[:tag].delete(:document_id)
    params[:tag][:user] = current_user
    if @document.tag_list.add(params[:tag][:name])
      @document.save
      flash[:notice] = "Successfully added tag."
    else
      flash[:error] = "There was a problem adding that tag."      
    end
 #   redirect_to :back
  end
  
  def destroy
    response = get_solr_response_for_doc_id
    document = SolrDocument.new(response.docs.first)    
    if document.tag_list.remove(Tags.find(params[:id]))
      document.save
      flash[:notice] = "Successfully removed that tag."
    else
      flash[:error] = "Couldn't remove that tag."
    end
    redirect_to :back
  end
  
  def clear    
    if (current_user.tags.clear)
      flash[:notice] = "Cleared your tags."
    else
      flash[:error] = "There was a problem clearing your tags."
    end
    redirect_to :action => "index"
  end
  
  protected
  def verify_user
    flash[:error] = "Please log in to manage and view your tags." and redirect_to :back unless current_user
  end
end
