# Be sure to restart your server when you modify this file.

# Your secret key for verifying cookie session data integrity.
# If you change this key, all old sessions will become invalid!
# Make sure the secret is at least 30 characters and all random, 
# no regular words or you'll be exposed to dictionary attacks.
ActionController::Base.session = {
  :key         => '_blacklight-app_session',
  :secret      => 'd5cc36ed6b885f711e799b8a497b0f77dc205c83f61bb5847ca22338d543a0fcc9d0dd7ce0bf6ffd141de7ff6b3f6b62e95d25f9040ab991cb2ac444f08f28a9'
}

# Use the database for sessions instead of the cookie-based default,
# which shouldn't be used to store highly confidential information
# (create the session table with "rake db:sessions:create")
# ActionController::Base.session_store = :active_record_store
