namespace :openvault do
  desc "Update mosaic"
  task :mosaic => :environment do
    require 'csv'
    require 'RMagick'
    conf = CSV.read('config/home.csv')
    bg = Magick::Image.new(1700, 325)
    (0..5).each do |row|
      x = 0
      y = row*45
      conf[row].each do |pid| 
        unless pid.nil?
          img = Magick::ImageList.new('http://openvault.wgbh.org/fedora/get/' + pid + '/sdef:THUMBNAIL/thumbnail')
          bg.composite!(img, x, y, Magick::OverCompositeOp)
        end 
        x += 60
      end
    end
    bg.write('public/mosaic.jpg')
  end

  desc "Load Artesia assetProperties file"
  task :ingest => :environment do
    files = [ENV['file']] if ENV['file']
    files.each do |f|
    print f + "\n"
    dataset = DatasetDam.new ENV['file']
    records = dataset.records
    records.each do |x| 
      print x.pid + "\n"
      x.save
    end
    end
  end

  desc "Add collection to pid"
  task :relationship => :environment do
    pid = ENV['pid']
    collection = ENV['collection']
    OpenvaultIngest.fedora.addRelationship :pid => pid, :relationship => 'info:fedora/fedora-system:def/relations-external#isMemberOfCollection', :object => 'info:fedora/org.wgbh.mla:' + collection.parameterize, :isLiteral => false, :datatype => nil
  end

  desc "Remove pid from collection"
  task :purge_relationship => :environment do
    pid = ENV['pid']
    collection = ENV['collection']
    OpenvaultIngest.fedora.purgeRelationship :pid => pid, :relationship => 'info:fedora/fedora-system:def/relations-external#isMemberOfCollection', :object => 'info:fedora/org.wgbh.mla:' + collection.parameterize, :isLiteral => false, :datatype => nil
  end
  desc "dc:identifiy  to pid"
  task :identify => :environment do
    id = ENV['id']
    query = 'PREFIX fedora-model: <info:fedora/fedora-system:def/model#>
PREFIX dc: <http://purl.org/dc/elements/1.1/>
PREFIX fedora-rels-ext: <info:fedora/fedora-system:def/relations-external#>
SELECT ?pid
WHERE {
  ?pid fedora-model:hasModel <info:fedora/wgbh:CONCEPT>.
  ?pid dc:identifier "' + id + '"
}'

    ri= RestClient.post Blacklight.fedora_config[:url] + "/risearch", :dt => 'on', :format => 'CSV', :lang => 'sparql', :limit => 0, :query => query, :type => 'tuples'
    print ri.body.gsub('"pid"' + "\n", "")
    
  end
end
