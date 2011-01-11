class Comment < ActiveRecord::Base

  include ActsAsCommentable::Comment

  belongs_to :commentable, :polymorphic => true

  default_scope :order => 'created_at ASC'

  # NOTE: install the acts_as_votable plugin if you
  # want user to vote on the quality of comments.
  #acts_as_voteable

  # NOTE: Comments belong to a user
  belongs_to :user

  acts_as_taggable
  
  def segment
    MediaSegment.new ActiveSupport::JSON.decode(metadata)
  end
end

class MediaSegment
  attr_accessor :clip_in, :clip_out, :duration
  attr_accessor :x1, :y1, :x2, :y2, :height, :width
  def initialize metadata = nil 
    metadata.each do |k,v|
      self.instance_variable_set("@#{k}", v)
    end unless metadata.nil? || metadata == false
  end

  def empty?
    clip_in.nil? && x1.nil?
  end

  def to_h
    hash_to_return = {}
    self.instance_variables.each do |var|
      hash_to_return[var.gsub("@","")] = self.instance_variable_get(var)
    end

    hash_to_return
  end

  def to_s
    return clip_in + " - " + clip_out unless clip_in.nil? or clip_out.nil?
    return clip_in unless clip_in.nil?
    return x1.to_s + "," + y1.to_s + "x" + x2.to_s + "," + y2.to_s unless x1.nil? or y1.nil? or x2.nil? or y2.nil?
    return x1.to_s + "," + y1.to_s unless x1.nil? or y1.nil?
    return ''
  end

  def to_smil
    return 'smil:begin="%s" smil:end="%s"' % [clip_in, clip_out] unless clip_in.nil? or clip_out.nil?
    return 'smil:begin="%s"' % clip_in unless clip_in.nil?
    return 'smil:coords="%s,%s,%s,%s"' % [x1, y1, x2, y2] unless x1.nil? or y1.nil? or x2.nil? or y2.nil?
  end
end
