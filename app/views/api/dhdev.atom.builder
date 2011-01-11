def solr_document_url d
      #entry.media :thumbnail, :url => 'http://openvault.wgbh.org/fedora/get/' + doc[:id] + '/sdef:THUMBNAIL/large'
      entry << '<media:thumbnail url="' + 'http://openvault.wgbh.org/fedora/get/' + doc[:id] + '/sdef:THUMBNAIL/large' + '" height="320" width="240" />'
 
end

atom_feed({'xmlns:openSearch' => 'http://a9.com/-/spec/opensearch/1.1/', 'xmlns:media' => 'http://search.yahoo.com/mrss/'}) do |feed|
  feed.title("THATCamp/DH2010 WGBH OpenVault Vietnam Transcripts Corpus")
  feed.tag!('openSearch:totalResults', @documents.length)
  feed.updated()
  for doc in @documents
    feed.entry(doc, :id => catalog_url(doc[:id]), :url => catalog_url(doc[:id])) do |entry|
      entry.title(doc.get('title'))
      entry.summary(doc.get('description'))
      entry.updated(doc.get('timestamp'))
      entry.link(:href => 'http://openvault.wgbh.org/fedora/get/' +  @asset_map[doc[:id]] + '/File', :type => 'text/xml', :rel => 'transcript') if @asset_map[doc[:id]]
      entry.author do |author|
        author.name('WGBH Educational Foundation')
      end
      entry.tag!('media:thumbnail', nil, {:url => 'http://openvault.wgbh.org/fedora/get/' + doc[:id] + '/sdef:THUMBNAIL/large', :height => 320, :width => 240})
      entry.tag!('media:thumbnail', :url => 'http://openvault.wgbh.org/swf/flowplayer.commercial-3.1.5.swf') do |embed|
        embed.tag!('media:param', 'application/x-shockwave-flash', :name => 'type')
	embed.tag!('media:param', 'config={"key":"#$1d73c2f04c85077c98a","clip":{"url":"http://openvault.wgbh.org/fedora/get/' + @video_map[doc[:id]] + '/Proxy","autoPlay":true,"autoBuffering":true,"provider":"lighttpd"},"plugins":{"lighttpd":{"url":"http://openvault.wgbh.org/fedora/swf/flowplayer.pseudostreaming-3.1.3.swf"},"audio":{"url":"http://openvault.wgbh.org/swf/flowplayer.audio-3.1.2.swf"},"controls":null},"playerId":"video","playlist":[{"url":"http://openvault.wgbh.org/fedora/get/' + @video_map[doc[:id]] + '/Proxy","autoPlay":true,"autoBuffering":true,"provider":"lighttpd"}]}', :name => 'flashvars')
	embed.tag!('media:param', '320', :name => 'width')
	embed.tag!('media:param', '240', :name => 'height')
      end if @video_map[doc[:id]]
      entry.tag!('media:credit', 'WGBH Educational Foundation', :role => 'producer', :scheme => 'urn:ebu')
      entry.tag!('media:player', :url => catalog_url(doc[:id]))
    end
  end
end
