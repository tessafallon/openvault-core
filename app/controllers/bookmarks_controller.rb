require 'vendor/plugins/blacklight/app/controllers/bookmarks_controller.rb'

class BookmarksController < ApplicationController
  include Blacklight::SolrHelper
  #alias :collection_dist :collection
  def collection
    user_id = current_user ? current_user.id : nil
    assocations = nil
    conditions = ['user_id = ?', user_id]
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
    bookmarks = Bookmark.find :all, :conditions => conditions, :include => assocations, :order => 'bookmarks.id ASC'
    bookmarks = bookmarks.tagged_with(params[:tag]) if params[:tag]
    b = bookmarks.paginate(:per_page => 100, :page => params[:page])
    @documents = {}
    page = params.delete :page
    b.each { |bookmark| response = get_solr_response_for_doc_id bookmark.document_id; @documents[bookmark.document_id] = SolrDocument.new response.first.docs.first } 
  params[:page] = page
    
    b
  end
  index.wants.csv { }
  index.wants.text { }
  index.wants.rss { }

end

