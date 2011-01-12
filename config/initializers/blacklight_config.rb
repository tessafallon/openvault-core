# You can configure Blacklight from here.
#  
#   Blacklight.configure(:environment) do |config| end
#   
# :shared (or leave it blank) is used by all environments.
# You can override a shared key by using that key in a particular
# environment's configuration.
#   
# If you have no configuration beyond :shared for an environment, you
# do not need to call configure() for that envirnoment.
# 
# For specific environments:
# 
#
#   Blacklight.configure(:test) {}
#   Blacklight.configure(:development) {}
#   Blacklight.configure(:production) {}
#

Blacklight.configure(:shared) do |config|
  SolrDocument.use_extension( Blacklight::Solr::Document::DublinCore)

  SolrDocument.field_semantics.merge!(
     :title => "title",
     :description => "description",
     :date => 'dc.date',
     :contributor => 'dc.contributor',
     :coverage => 'place',
     :type => 'dc.type', 
     :subject => 'topic'
  )


  config[:default_qt] = "search"
  config[:default_solr_params] = { :qt => 'search', :per_page => 10, :facets => ['topic', 'people', 'place', 'year', 'rdf.child.hasModel', 'pbcore.title_Series'] }



  # solr field values given special treatment in the show (single result) view
  config[:show] = {
    :html_title => "title",
    :heading => "title",
    :display_type => "format"
  }

  # solr fld values given special treatment in the index (search results) view
  config[:index] = {
    :show_link => "title",
    :num_per_page => 10,
    :record_display_type => "format"
  }

  # solr fields that will be treated as facets by the blacklight application
  #   The ordering of the field names is the order of the display
  config[:facet] = {
    :field_names => [
            "topic",
            "people",
            "place",
            "year",
            "rdf.child.hasModel",
            "pbcore.title_Series",
    ],
    :labels => {
                 "topic"             => "Topic",
                 "people"           => "People",
                 "place"        => "Place",
                 "year" => "Date",
                 "rdf.child.hasModel" => "Media",
                 "pbcore.title_Series" => "Series",
    },
    :limits => {
      nil => 10
    }
  } 
            
  # solr fields to be displayed in the index (search results) view
  #   The ordering of the field names is the order of the display
  config[:index_fields] = {
    :field_names => [
            "dc.date",
            "dc.coverage.PlaceName",
            "pbcore.title_SeriesProgram"
    ],
    :labels => {
                 "dc.date"      => "Date Created",
                 "dc.coverage.PlaceName"        => "Place Created",
                 'pbcore.title_SeriesProgram' => "Series/Program Title"
    }
  }

  # solr fields to be displayed in the show (single result) view
  #   The ordering of the field names is the order of the display 
  config[:show_fields] = {
    :field_names => [
            "description",
            "dc.contributor",
            "dc.type"
    ],
    :labels => {
                 "description"       => "Description:",
                 "dc.contributor" => "Contributor:",
                 "dc.type"    => "Type:"
    }
  }

  config[:mlt] = { :fields => ['topic', 'pbcore.description', 'pbcore.title'] }

# FIXME: is this now redundant with above?
  # type of raw data in index.  Currently marcxml and marc21 are supported.
  config[:raw_storage_type] = "marc21"
  
# name of solr field containing raw data
  config[:raw_storage_field] = "marc_display"

  # "fielded" search select (pulldown)
  # label in pulldown is followed by the name of a SOLR request handler as
  # defined in solr/conf/solrconfig.xml
  config[:search_fields] ||= []
  config[:search_fields] << ['All Fields', 'search']
#  config[:search_fields] << ['Title', 'title_search']
#  config[:search_fields] << ['Author', 'author_search']
#  config[:search_fields] << ['Subject', 'subject_search']

  # "sort results by" select (pulldown)
  # label in pulldown is followed by the name of the SOLR field to sort by and
  # whether the sort is ascending or descending (it must be asc or desc
  # except in the relevancy case).
  # label is key, solr field is value
  config[:sort_fields] ||= []
  config[:sort_fields] << ['relevance']
  config[:sort_fields] << ['title']
  #config[:sort_fields] << ['dc.date', 'dc.date_sort asc']
  #config[:sort_fields] << ['dc.type', 'dc.type_sort asc']
#  config[:sort_fields] << ['relevance', 'score desc, pub_date_sort desc, title_sort asc']
#  config[:sort_fields] << ['year', 'pub_date_sort desc, title_sort asc']
#  config[:sort_fields] << ['author', 'author_sort asc, title_sort asc']

  # If there are more than this many search results, no spelling ("did you
  # mean") suggestion is offered.
  config[:spell_max] = 5

  config[:notifier_address] = 'root@localhost'
  config[:admin] = 'root@localhost'

    config[:oai] = {
    :provider => {
      :repository_name => 'Test',
      :repository_url => 'http://localhost',
      :record_prefix => '',
      :admin_email => 'root@localhost'
    },
    :document => {
    }
  }


end

