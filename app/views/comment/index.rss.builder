xml.instruct! :xml, :version=>"1.0"
xml.rss(:version=>"2.0", 'xmlns:media' => 'http://search.yahoo.com/mrss/') {
        
  xml.channel {
          
    xml.title('Open Vault Annotations')
    xml.link(formatted_catalog_index_url(:rss, params))
    xml.description('Open Vault Annotations')
    xml.language('en-us')
    
    @comments.each do |comment|
      xml.item do
	if @documents[comment.commentable_id]
    doc =  @documents[comment.commentable_id]
        xml.title( doc.get('title') + ": " + comment.title)                              
        xml.link(catalog_url(doc[:id]))                                   
	xml.media :thumbnail, :url => fedora_url + "/get/" + doc[:id] + "/sdef:THUMBNAIL/get"

	end
	xml.description( comment.comment)
	xml.author( comment.user )
	xml.guid( comment.id)
      end
    end
          
  }
}
