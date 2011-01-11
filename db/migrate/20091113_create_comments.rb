class CreateComments < ActiveRecord::Migration
  def self.up
    create_table :comments do |t|
      t.string :title, :limit => 50, :default => ""
      t.text :comment, :default => ""
      t.text :metadata, :default => ""
      t.references :commentable, :polymorphic => true
      t.references :user
      t.timestamps
    end

    change_column :comments, :commentable_id, :string
    add_index :comments, :commentable_type
    add_index :comments, :commentable_id
    add_index :comments, :user_id
  end

  def self.down
    drop_table :comments
  end
end
