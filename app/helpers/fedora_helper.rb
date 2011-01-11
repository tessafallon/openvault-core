module FedoraHelper
        def fedora_url                
		Blacklight.fedora_config[:url]        
	end        
	def fedora_ancestors pid
		query = 'PREFIX fedora-model: <info:fedora/fedora-system:def/model#>
PREFIX dc: <http://purl.org/dc/elements/1.1/>
PREFIX fedora-rels-ext: <info:fedora/fedora-system:def/relations-external#>
SELECT ?pid ?cmodel ?title
WHERE {
  {
    { ?pid fedora-rels-ext:hasMember <info:fedora/' + pid + '> } UNION
    { <info:fedora/' + pid + '>  fedora-rels-ext:isMemberOfCollection ?pid }
  } UNION {
    <info:fedora/' + pid + '> fedora-rels-ext:isMemberOfCollection ?p.
    ?p fedora-rels-ext:isMemberOfCollection ?pid.
  }
  ?pid fedora-model:hasModel ?cmodel.
  OPTIONAL { ?pid dc:title ?title }
}'
    rels_ext = RestClient.post Blacklight.fedora_config[:internal_url] + "/risearch", :dt => 'on', :format => 'Sparql', :lang => 'sparql', :limit => 100, :query => query, :type => 'tuples'
                doc = Nokogiri::XML(rels_ext.body)
                doc.xpath('//sparql:result', 'sparql'=>"http://www.w3.org/2001/sw/DataAccess/rf1/result")

	end
	def fedora_parts pid                
		query = 'PREFIX fedora-model: <info:fedora/fedora-system:def/model#>
PREFIX dc: <http://purl.org/dc/elements/1.1/>
PREFIX fedora-rels-ext: <info:fedora/fedora-system:def/relations-external#>
SELECT ?pid ?cmodel ?title
WHERE {
  {
    { ?pid fedora-rels-ext:isPartOf <info:fedora/' + pid + '> } UNION
    { <info:fedora/' + pid + '>  fedora-rels-ext:hasPart ?pid }
  }
  ?pid fedora-model:hasModel ?cmodel.
  OPTIONAL { ?pid dc:title ?title }
}'
		rels_ext = RestClient.post Blacklight.fedora_config[:internal_url] + "/risearch", :dt => 'on', :format => 'Sparql', :lang => 'sparql', :limit => 100, :query => query, :type => 'tuples'
		doc = Nokogiri::XML(rels_ext.body)
  		doc.xpath('//sparql:result', 'sparql'=>"http://www.w3.org/2001/sw/DataAccess/rf1/result")
        end

        def fedora_check_rights(pid, permission)
		begin
			fedora_eval_rights pid, permission
			true
		rescue ODRL::Rights::InsufficientPrivileges
			false
		end
        end
	def fedora_eval_rights(pid, permission)
		return if pid.nil?
		begin
                d = ODRL::Rights::Document.new
                d.doc = open(Blacklight.fedora_config[:internal_url] + '/get/' + pid + '/Rights')
                d.eval permission, {}, current_user, {}
                rescue OpenURI::HTTPError
                end

	end

        def render_fedora_partial(document, pid, cmodel)
        cmodel.tr!(':.-', '_')
        pid = pid.split('/')[1]
        begin
                if fedora_check_rights(pid, 'play')
      			render :partial=>"fedora/_show_partials/#{cmodel}", :locals=>{:document => document, :fedora_object=>pid}
		else
                render :partial => "fedora/_show_partials/odrl_rights_insufficientprivileges", :locals=>{:document => document, :fedora_object=>pid} unless cmodel == "info:fedora/fedora-system:FedoraObject-3.0".tr(':.-', '_')
		end

    rescue ActionView::MissingTemplate

      render :partial=>"fedora/_show_partials/default", :locals=>{:document => document, :fedora_object=>pid, :cmodel => cmodel}
    end
  end
        def render_metadata_partial(pid, cmodel)
                cmodel.tr!(':.-', '_')
                begin
                        render :partial => "fedora/_metadata_partials/#{cmodel}", :locals => {:fedora_object => pid }
                end
        end
end

