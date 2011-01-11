xml.instruct!

xml.oembed do
	xml.type get_oembed_type_for(@pid, @models)
	xml.version "1.0"
	xml.cache_age "3600"
	xml.provider_name "WGBH Open Vault"
	xml.provider_url "http://openvault.wgbh.org"
	xml.thumbnail_url fedora_url + "/get/" + @pid + "/sdef:THUMBNAIL/large"
	xml.thumbnail_width 320
	xml.thumbnail_height 240
@parts.select { |r| params['asset'].nil? || r.at('pid')['uri'] == params['asset'] }.map { |r| r.at('pid')['uri'].split('/').last }.uniq.each do |pid|
	xml << render_oembed_partial( pid, get_oembed_type_for(@pid, @models))
end
	xml.title @document[:title]
	xml.description @document[:description]
end
