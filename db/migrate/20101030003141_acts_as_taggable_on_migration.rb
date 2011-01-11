class ActsAsTaggableOnMigration < ActiveRecord::Migration
  def self.up
    change_table :taggings do |t|
      t.column :tagger_id, :integer
      t.column :tagger_type, :string
      t.column :context, :string
    end
    
    add_index :taggings, [:taggable_id, :taggable_type, :context]
    Tagging.update_all ["context = ?", "tags"]
  end
  
  def self.down
    remove_column :taggings, :tagger_id
    remove_column :taggings, :tagger_typei
    remove_column :taggings, :context
  end
end
