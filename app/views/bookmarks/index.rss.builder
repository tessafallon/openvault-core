xml.instruct! :xml, :version=>"1.0"
xml.rss(:version=>"2.0", 'xmlns:media' => 'http://search.yahoo.com/mrss/') {
        
  xml.channel {
          
    xml.title('Open Vault Annotations')
    xml.link(formatted_catalog_index_url(:rss, params))
    xml.description('Open Vault Annotations')
    xml.language('en-us')
    
    @bookmarks.each do |bookmark|
      xml.item do
    doc =  @documents[bookmark.document_id]

        xml.title( doc.get('title') + ": " + comment.title)                              
        xml.link(catalog_url(doc[:id]))                                   
	xml.description( doc.get('description'))
	xml.guid(catalog_url(doc[:id]))
	xml.media :thumbnail, :url => fedora_url + "/get/" + doc[:id] + "/sdef:THUMBNAIL/get"
      end
    end
          
  }
}
