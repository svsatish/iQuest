Feature: UI Test

  Scenario: Navigate to SauceDemo
    * Navigate to "https://www.saucedemo.com/"
    * Should see the login page with username and password fields
    * Enter "standard_user" in the username field
    * Enter "secret_sauce" in the password field
    * Click the login button
    * Should see the inventory page with products listed
