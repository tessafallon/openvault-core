@search
Feature: Search
  In order to find documents
  As a user
  I want to enter terms, select fields, and select number of results per page

  Scenario: Search Page
    When I go to the catalog page
    Then I should see a search field
    And I should see a selectable list with field choices
    And I should see a "search" button
    And I should not see the "startOverLink" element
    And I should see "Welcome!"

  Scenario: Search Page's browsing filters 
    When I am on the catalog page
    Then I should see select list "#browse select" with field labels "choose category"

  Scenario: Search Page's facet filters 
    When I am on the catalog page
    Then I should see the "facets" element
    And I should see "Type" within "div.facet"
    And I should see "Format" within "div.facet[2]"
    And I should see "People" within "div.facet[3]"
    And I should see "Place" within "div.facet[4]"
    And I should see "Date" within "div.facet[5]"

  Scenario: Submitting a Search
    When I am on the home page
    And I fill in "q" with "vietnam"
    And I press "search"
    Then I should be on "the catalog page"
    And I should see "results for vietnam"

  Scenario: Can change view style
    When I am on the home page
    And I fill in "q" with "vietnam"
    And I press "search"
    Then I should be on "the catalog page"
    And I should see "View as"
    And I should see "List" within ".style-selector"
    And I should see "Gallery" within ".style-selector"

  Scenario: Results Page Shows Proper Columns 
    Given I am on the home page
    And I fill in "q" with "vietnam"
    When I press "search"
    Then I should see "Title" within "th.title"
    And I should see " " within "th.type"
    And I should see "Date Created" within "th.date-created"
    And I should see "Place" within "th.place"
    And I should see "Series/Program Title" within "th.series-program-title"

  Scenario: Results Page Default View is List
    Given I am on the home page
    And I fill in "q" with "vietnam"
    When I press "search"
    Then I should see "List" within ".style-selector .selected_true"

  Scenario: Results Page Shows Gallery
    Given I am on the home page
    And I fill in "q" with "vietnam"
    When I press "search"
    And I follow "Gallery"
    Then I should see "Gallery" within ".style-selector .selected_true"

  Scenario: Change number of records per page
    Given I am on the home page
    And I fill in "q" with "vietnam"
    When I press "search"
    And I select "20" from "per_page"
    And I press "update"
    Then I should have 20 "tr.document"

  Scenario: Video excerpts should have (Video Excerpt) in the title
    Given I am on the home page
    And I fill in "q" with "video excerpt"
    When I press "search"
    Then I should see "(Video Excerpt)" within ".document h3"

  Scenario: Search is active after submitting a search
    When I am on the home page
    And I fill in "q" with "vietnam"
    And I press "search"
    Then I should be on "the catalog page" 
    And I should see "Search" within "h2[2]"

    
