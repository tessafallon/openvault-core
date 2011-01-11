require 'vendor/plugins/blacklight/app/controllers/catalog_controller.rb'

class CatalogController < ApplicationController
  def tag
  #  arr = (Surrogate.find_tagged_with params[:tag]).map { |s| s.id }
  #  arr = ['org.wgbh.mla:a32fe44fa5b2b0136c544e2893f6b9aee53e5493']
     arr = (Tag.find_by_sql ["SELECT * FROM tags WHERE name IN (?)", params[:tag]]).map { |tag| tag.taggings.map(&:taggable_id) }.flatten
    (@response, @document_list) = get_search_results({:q => 'id:(' + arr.compact.reject { |s| s.blank? }.map { |s| s.gsub(':', '\:') }.join(' OR ') + ')'})
    params[:q] = params[:tag]
    @filters = params[:f] || []
    respond_to do |format|
      format.html { render 'index' }
    end
  end
end
