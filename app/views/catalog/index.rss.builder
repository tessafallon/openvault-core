xml.instruct! :xml, :version=>"1.0"
xml.rss(:version=>"2.0", 'xmlns:media' => 'http://search.yahoo.com/mrss/') {
        
  xml.channel {
          
    xml.title('Open Vault Catalog Search Results')
    xml.link(formatted_catalog_index_url(:rss, params))
    xml.description('Open Vault Catalog Search Results')
    xml.language('en-us')
    
    @response.docs.each do |doc|
      xml.item do
        xml.title( doc['title'])                              
        xml.link(catalog_url(doc[:id]))                                   
	xml.description( doc.get('description'))
	xml.author( doc.get('dc.contributor') )
	xml.guid( doc['id'])
	xml.media :thumbnail, :url => fedora_url + "/get/" + doc[:id] + "/sdef:THUMBNAIL/get"
    	parts = @template.fedora_parts(doc['id'])
	models = parts.map { |r| r.at('cmodel')['uri'] }
#	if models.include? 'info:fedora/wgbh:VIDEO'
#		xml.media :content, :type => 'video/h264', :url => fedora_url + "/get/" + parts.find { |r| r.at('cmodel')['uri'] == 'info:fedora/wgbh:VIDEO'}.at('pid')['uri'].split('/').last + "/Proxy"
#	elsif models.include? 'info:fedora/wgbh:IMAGE'
#		xml.media :content, :type => 'image/jpg', :url => fedora_url + "/get/" + parts.find { |r| r.at('cmodel')['uri'] == 'info:fedora/wgbh:IMAGE'}.at('pid')['uri'].split('/').last + "/Full"
#	end
      end
    end
          
  }
}
