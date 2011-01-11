When /^I follow "([^\"]*)" in "([^\"]*)"$/ do |link, scope|
  click_link_within(scope, link)
end

Then /^I should have ([0-9]+) "([^\"]*)"$/ do |count, selector|
  response.should have_selector(selector, :count => count)
end

