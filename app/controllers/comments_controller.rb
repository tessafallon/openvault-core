class CommentsController < ApplicationController
  include Blacklight::SolrHelper
  
  # see vendor/plugins/resource_controller/
  resource_controller
  
   # acts_as_taggable_on_steroids plugin
  helper TagsHelper
  
  before_filter :verify_user, :except => :index


  # overrides the ResourceController collection method
  # see vendor/plugins/resource_controller/
  def collection
    user_id = current_user ? current_user.id : nil
    assocations = nil

    conditions = ['user_id = ?', user_id] unless user_id.nil?
    conditions = ['public = true'] if user_id.nil?
    if params[:id]
      conditions.first << ' AND id IN (?)'
      conditions += [params[:id]]
    end
    if params[:a] == 'find' && ! params[:q].blank?
      q = "%#{params[:q]}%"
      conditions.first << ' AND (tags.name LIKE ? OR title LIKE ? OR notes LIKE ?)'
      conditions += [q, q, q]
      assocations = [:tags]
    end
    comments = Comment.find :all, :conditions => conditions, :include => assocations, :order => 'comments.id ASC'
    comments = comments.tagged_with(params[:tag]) if params[:tag]
    c = comments.paginate(:per_page => 100, :page => params[:page])
    @documents = {}
    c.each { |comment| 
	begin
response = get_solr_response_for_doc_id comment.commentable_id; @documents[comment.commentable_id] = SolrDocument.new response.first.docs.first 
	rescue
	end
} 
    c 
  end
  index.wants.csv { }
  index.wants.text { }
  index.wants.rss { }
  
  update.wants.html { redirect_to :back }

  create.wants.js { render :template => "create.rjs" } 
  create.wants.html { redirect_to :back }
  
  def create
    @response, @document = get_solr_response_for_doc_id params[:comment][:document_id]
    params[:comment].delete(:document_id)
    params[:comment][:user] = current_user
    if @document.comments.create(params[:comment])
      flash[:notice] = "Successfully added comment."
    else
      flash[:error] = "There was a problem adding that comment."      
    end
  #  redirect_to :back
  end
  
  def destroy
    if current_user.comments.find(params[:id]).delete
      flash[:notice] = "Successfully removed that comment."
    else
      flash[:error] = "Couldn't remove that comment."
    end
    redirect_to :back
  end
  
  def clear    
    if (current_user.comments.clear)
      flash[:notice] = "Cleared your comments."
    else
      flash[:error] = "There was a problem clearing your comments."
    end
    redirect_to :action => "index"
  end
  
  protected
  def verify_user
    flash[:error] = "Please log in to manage and view your comments." and redirect_to :back unless current_user
  end
end
