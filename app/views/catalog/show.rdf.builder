xml.instruct! :xml, :version=>"1.0"

xml << open(fedora_url + '/get/' + @document.get('id') + '/sdef:METADATA/RDF').read
