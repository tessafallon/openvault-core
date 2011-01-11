BlacklightAdvancedSearch.config.merge!(
  # This will be used later when edismax is returning the expected results
  #:solr_type => "edismax",
  #:solr_type => "dismax",
  # :search_field => "advanced", # name of key in Blacklight URL, no reason to change usually. 
  :qt => "search" # name of Solr request handler, leave unset to use the same one as your Blacklight.config[:default_qt]  
)

  # You don't need to specify search_fields, if you leave :qt unspecified
  # above, and have search field config in Blacklight already using that
  # same qt, the plugin will simply use them. But if you'd like to use a
  # different solr qt request handler, or have another reason for wanting
  # to manually specify search fields, you can. Uses the hash format
  # specified in Blacklight::SearchFields
  search_fields = []


  search_fields << {
    :key => 'pbcore.title_text',
    :display_label => "Title",
    :solr_local_parameters => {
      :pf => '$pf_pbcore.title_text',
      :qf => '$qf_pbcore.title_text'
    }
  }
  search_fields << {
    :display_label => "Description",
    :key => 'pbcore.description_text',
    :solr_local_parameters => {
      :pf => '$pf_pbcore.description_text',
      :qf => '$qf_pbcore.description_text'
    }
  }
  search_fields << {
    :display_label => "Identifier",
    :key => 'pbcore.identifier',
    :solr_local_parameters => {
      :pf => '$pf_pbcore.identifier',
      :qf => '$qf_pbcore.identifier'
    }
  }
  search_fields << {
    :display_label => "Subject",
    :key => 'topic_text',
    :solr_local_parameters => {
      :pf => '$pf_topic_text',
      :qf => '$qf_topic_text'
    }
  }
  search_fields << {
    :key => 'people_text',
    :display_label => "People",
    :solr_local_parameters => {
      :pf => '$pf_people_text',
      :qf => '$qf_people_text'
    }
  }
  search_fields << {
    :key => 'place_text',
    :display_label => "Place",
    :solr_local_parameters => {
      :pf => '$pf_place_text',
      :qf => '$qf_place_text'
    }
  }
  search_fields << {
    :key => 'fulltext',
    :display_label => "Content",
    :solr_local_parameters => {
      :pf => '$pf_fulltext',
      :qf => '$qf_fulltext'
    }
  }
  BlacklightAdvancedSearch.config[:search_fields] = search_fields

 BlacklightAdvancedSearch.config[:form_solr_parameters] = {
   "facet.field" => [
     "people",
     "place",
     "date",
     "topic",
     "dc.creator",
     "pbcore.title_Series"
   ],
   "facet.limit" => -1,  # all facet values
   "facet.sort" => "index",  # sort by index value (alphabetically, more or less)
   "facet.mincount" => "2"
 }
