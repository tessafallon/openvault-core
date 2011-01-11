require_dependency 'vendor/plugins/blacklight/app/helpers/application_helper.rb'
# Methods added to this helper will be available to all templates in the application.
module ApplicationHelper
  include TagsHelper
  include Blacklight::SolrHelper
  def application_name
    "WGBH Open Vault"
  end
        def facet_counts f
          s = Blacklight.solr.find({:rows => 0, 'facet.field' => f})
          s.facet_counts['facet_fields'].each_key { |k|
            s.facet_counts['facet_fields'][k] = s.facet_counts['facet_fields'][k].each_slice(2).map.sort
          }
          s.facet_counts['facet_fields']
        end
        def browse_hierarchy browse_field
          s = Blacklight.solr.find({:rows => 0, 'facet.field' => browse_field})
          root = Tree::TreeNode.new("", "")
	  return root unless  s.facet_counts['facet_fields'][browse_field]
          arr = s.facet_counts['facet_fields'][browse_field].each_slice(2).map.sort
          last = root
          arr.each do |tupl|
           next if tupl.first.empty?
           until tupl.first =~ Regexp.new(Regexp.quote(last.name) + "\\b")
             last = last.parent
           end
           node = Tree::TreeNode.new(tupl.first, tupl.last)
           last << node
           last = node
          end
         root
        end
        def get_solr_documents_by_ids id
         solr_response = Blacklight.solr.find( {:qt => 'standard', :per_page => 1000, :q => 'id:(' + id.compact.reject { |s| s.blank? }.join(' OR ').gsub(':', '\:') + ')' } )

	  document_list = solr_response.docs.collect {|doc| SolrDocument.new(doc)}

	  return document_list
        end
        def results_count input
                input[:rows] = 0
                d = Blacklight.solr.find input
                d['response']['numFound'].to_i
        end
	def document_list_with_style s   
		p = params.dup    
		p.delete :page   
		p[:style] = s    
		catalog_index_path(p)        
	end
 
  def ts(str, options={})
    t(str, {:default => str}.deep_merge(options))
  end

 # facet param helpers ->
  #

  # Standard display of a facet value in a list. Used in both _facets sidebar
  # partial and catalog/facet expanded list. Will output facet value name as
  # a link to add that to your restrictions, with count in parens. 
  # first arg item is a facet value item from rsolr-ext.
  # options consist of:
  # :suppress_link => true # do not make it a link, used for an already selected value for instance
  def render_facet_value(facet_solr_field, item, options ={})
    link_to_unless(options[:suppress_link], ts(item.value), add_facet_params_and_redirect(facet_solr_field, item.value), :class=>"facet_select label") + " " + render_facet_count(item.hits)
  end

  def h s
    return s.to_s if s.to_s.html_safe?
    super(s)
  end


  def render_google_analytics_code
    render :partial => 'layouts/ga', :locals => { :tracker_id => GOOGLE_ANALYTICS_TRACKER_ID }
  end
end

