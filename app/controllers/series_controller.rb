class SeriesController < ApplicationController
  
  # get search results from the solr index
  def index
    query = 'PREFIX fedora-model: <info:fedora/fedora-system:def/model#>
PREFIX dc: <http://purl.org/dc/elements/1.1/>
PREFIX fedora-rels-ext: <info:fedora/fedora-system:def/relations-external#>
SELECT ?pid ?type ?title ?description ?parent
WHERE {
  ?pid fedora-model:hasModel <info:fedora/wgbh:COLLECTION>.
  OPTIONAL { ?pid dc:title ?title }
  OPTIONAL { ?pid dc:type ?type }
  OPTIONAL { ?pid fedora-rels-ext:isMemberOfCollection ?parent}
  OPTIONAL { ?pid dc:description ?description }
}'

    ri= RestClient.post Blacklight.fedora_config[:url] + "/risearch", :dt => 'on', :format => 'Sparql', :lang => 'sparql', :limit => 0, :query => query, :type => 'tuples'

    doc = Nokogiri::XML(ri.body)

    arr = []
    doc.xpath('//sparql:result', 'sparql'=>"http://www.w3.org/2001/sw/DataAccess/rf1/result").each do |r|
	    	arr << {:pid => r.at('pid')['uri'].split('/').last,  :title => r.at('title').text, :description => r.at('description').text, :type => r.at('type').text }
    end

    @collections, @series = arr.reject { |i| i[:type] == 'Subcollection' }.sort_by { |i| i[:title] }.partition { |i| i[:type] == 'Collection' }

    respond_to do |format|
      format.html     
    end
  end
end
