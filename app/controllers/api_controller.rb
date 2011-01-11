require 'uri'
class ApiController < ApplicationController
  include Blacklight::SolrHelper
  def unapi
    @id = params[:id]
    @format = params[:format]
    return render :file => 'api/unapi-info.xml.builder' if @id.nil?
    return render :file => 'api/unapi-formats.xml.builder' if @format.nil?

    Mime::Type.register "application/xml", :oai_dc
    Mime::Type.register "application/xml", :pbcore
    Mime::Type.register "image/jpeg", :jpg

    respond_to do |format|
      format.oai_dc { redirect_to(@template.fedora_url + '/get/' + @id + '/sdef:METADATA/DC')  }
      format.pbcore { redirect_to(@template.fedora_url + '/get/' + @id + '/sdef:METADATA/PBCore')  }
      format.jpg { redirect_to(@template.fedora_url + '/get/' + @id + '/sdef:THUMBNAIL/large')  }
    end

  end

  def dhdev
    query = 'PREFIX fedora-model: <info:fedora/fedora-system:def/model#>
PREFIX dc: <http://purl.org/dc/elements/1.1/>
PREFIX fedora-rels-ext: <info:fedora/fedora-system:def/relations-external#>
SELECT ?pid ?model ?concept
WHERE {
{
?pid fedora-rels-ext:isPartOf ?p.
?p fedora-rels-ext:isPartOf ?concept.
?pid <info:fedora/fedora-system:def/model#hasModel> ?model.
} UNION {
?pid fedora-rels-ext:isPartOf ?concept.
?pid <info:fedora/fedora-system:def/model#hasModel> ?model.
}
}'

    rels_ext = RestClient.post Blacklight.fedora_config[:internal_url] + "/risearch", :dt => 'on', :format => 'Sparql', :lang => 'sparql', :limit => 0, :query => query, :type => 'tuples'
    doc = Nokogiri::XML(rels_ext.body)
    ri = doc.xpath('//sparql:result', 'sparql'=>"http://www.w3.org/2001/sw/DataAccess/rf1/result")
    @asset_map = Hash[*ri.select { |r| r.at('model')['uri'].to_s == 'info:fedora/wgbh:LOG' }.map { |r| [ r.at('concept')['uri'].to_s.split('/').last, r.at('pid')['uri'].to_s.split('/').last ]}.flatten]
    @video_map = Hash[*ri.select { |r| r.at('model')['uri'].to_s == 'info:fedora/wgbh:VIDEO' }.map { |r| [ r.at('concept')['uri'].to_s.split('/').last, r.at('pid')['uri'].to_s.split('/').last ]}.flatten]
    @response, @documents  = get_search_results({:per_page => 1000, :f => { 'pbcore.title_Series' => 'Vietnam: A Television History', 'rdf.child.hasModel' => 'info:fedora/wgbh:LOG' }})
    respond_to do |format|
      format.atom
    end
  end

  def oembed
    @params = params
    @url = params[:url]
    uri = URI.parse(@url)
    @pid = get_pid(uri.path)
    response = get_solr_response_for_doc_id @pid
    @document = SolrDocument.new response.first.docs.first
    @parts = @template.fedora_parts(@pid)
    @models = @parts.map { |r| r.at('cmodel')['uri'] }
    respond_to do |format|
      format.xml {}
      format.json { render :json => Hash.from_xml(render_to_string(:template => 'api/oembed.xml.builder', :layout => false))['oembed'].to_json, :layout => false}
      format.html { render :layout => false }
    end
  end
  def uriplay
    @params = params
    @url = params[:url]
    uri = URI.parse(@url)
    @pid = get_pid(uri.path)
    @models = @template.fedora_parts(@pid).map { |r| r.at('cmodel')['uri'] }
  
    respond_to do |format|
      format.xml {}
    end
  
  end

  
  def get_pid url
    url.slice(/\/[A-Za-z0-9\.\-]+:[A-Za-z0-9_\.\-]+/).delete("/")
  end
end

