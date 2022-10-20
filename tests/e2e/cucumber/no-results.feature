Feature: No-results component

  Scenario Outline: 1. No results message exists and contains the query
    Given start page with "<view>" size view
    When  start button is clicked
    And   "<query>" is searched
    Then  no results message is displayed
    And   there are no results
    Examples:
      | query    | view        |
      | asdfgh   | macbook-13  |
      | asdfgh   | iphone-7    |
