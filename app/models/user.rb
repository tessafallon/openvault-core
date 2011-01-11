require 'vendor/plugins/blacklight/app/models/user.rb'

class User < ActiveRecord::Base
  attr_accessible :login, :email, :password, :password_confirmation, :first_name, :last_name, :zip_code, :country, :email_updates, :terms_and_conditions

  validates_acceptance_of :terms_and_conditions, :on => :create, :accept => true
  validates_presence_of :first_name
  validates_presence_of :last_name
  validates_presence_of :zip_code

  def active?
    active
  end
  def activate!
    self.active = true
    save
  end
  def deliver_password_reset_instructions!  
    reset_perishable_token!  
    Notifier.deliver_password_reset_instructions(self)  
  end
  def deliver_activation_instructions!
    reset_perishable_token!
    Notifier.deliver_activation_instructions(self)
  end

  def deliver_activation_confirmation!
    reset_perishable_token!
    Notifier.deliver_activation_confirmation(self)
  end

  def full_name
    "#{first_name} #{last_name}"
  end
end
