ActionController::Routing::Routes.draw do |map|
  map.root :controller => 'home', :action=>'index'
  #Blacklight::Routes.build map

  # The priority is based upon order of creation: first created -> highest priority.

  map.collections '/collection/:id', :controller => 'proxy', :action => 'redirect'

  map.oai '/oai', :controller => 'catalog', :action => 'oai'
  
#  map.resources :password_resets
  map.resources :password_resets, :only => [ :new, :create, :edit, :update ]

  map.print_transcript '/transcript/:id', :controller => 'tei', :action => 'show'
  map.print_log '/log/:id', :controller => 'newsml', :action => 'show'

  #map.reset_password '/reset_password', :controller => 'password_resets', :action => 'new'
  map.register '/register/:activation_code', :controller => 'activations', :action => 'new'
  map.activate '/activate/:id', :controller => 'activations', :action => 'create'

  map.resources :comments, :collection => {:clear => :delete}  
  map.resources :tags, :collection => {:clear => :delete}

  map.resources(:viz,
      :only => [:index, :show, :update],
      # /catalog/map
      :collection => {:map => :get, :opensearch=>:get},
      :requirements => { :id => /([A-Za-z0-9]|-|\.)+:(([A-Za-z0-9])|-|~|_|(%[0-9A-F]{2}))+/ }
    )

    # Login, Logout, UserSessions
    map.resources :user_sessions, :protocol => ((defined?(SSL_ENABLED) and SSL_ENABLED) ? 'https' : 'http')
    map.login "login", :controller => "user_sessions", :action => "new"
    map.logout "logout", :controller => "user_sessions", :action => "destroy"

    # Set the default controller:
    #map.root :controller => 'catalog', :action=>'index'
    map.resources :bookmarks, :collection => {:clear => :delete}
    map.resource :user

    map.catalog_facet "catalog/facet/:id", :controller=>'catalog', :action=>'facet'

    map.resources :search_history, :collection => {:clear => :delete}
    map.resources :saved_searches, :collection => {:clear => :delete}, :member => {:save => :put}

    map.resources(:catalog,
      :only => [:index, :show, :update],
      # /catalog/:id/image <- for ajax cover requests
      # /catalog/:id/status
      # /catalog/:id/availability
      :member=>{:image=>:get, :status=>:get, :availability=>:get, :citation=>:get, :send_email_record=>:post, :email=>:get, :sms=>:get, :librarian_view=>:get},
:requirements => { :id => /([A-Za-z0-9]|-|\.)+:(([A-Za-z0-9])|-|~|_|(%[0-9A-F]{2}))+/ },
      # /catalog/map
      :collection => {:map => :get, :opensearch=>:get}
    )

    map.feedback 'feedback', :controller=>'feedback', :action=>'show'
    map.feedback_complete 'feedback/complete', :controller=>'feedback', :action=>'complete'

  map.connect ':controller/:action/:id'
  map.connect ':controller/:action/:id.:format'
end
