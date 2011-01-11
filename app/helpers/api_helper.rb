module ApiHelper  
	def render_oembed_partial pid, type    
		render :partial=>"api/_oembed_partials/#{type}.xml.builder", :locals=>{:fedora_object=>pid}  
	end  

	def get_oembed_type_for pid, models    
		begin      
			if fedora_check_rights pid, 'embed'      
      				return 'video' if models.include? 'info:fedora/wgbh:VIDEO'
      				return 'photo' if models.include? 'info:fedora/wgbh:IMAGE'
			end
    
    			rescue ActionView::MissingTemplate
   		 end 
		return 'link'
	end
  
  def render_uriplay_partial pid, type
    render :partial=>"api/_uriplay_partials/#{type}.xml.builder", :locals=>{:fedora_object=>pid}
  
  end
  def get_uriplay_type_for pid, models
    begin
      begin
#       fedora_check_rights pid, 'embed'
      rescue OpenURI::HTTPError
      end
      
      return 'video' if models.include? 'info:fedora/wgbh:VIDEO'
      return 'audio' if models.include? 'info:fedora/wgbh:AUDIO'
    
    rescue ODRL::Rights::InsufficientPrivileges
    rescue ActionView::MissingTemplate
    end
    
    return 'none'  
    end
end
