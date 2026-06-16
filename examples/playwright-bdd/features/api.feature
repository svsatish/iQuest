Feature: API

  Scenario: API Testing
    * Hit API URL: https://automationexercise.com/api/productsList with Request Method: GET
    * Response Code should be 200
    * Response Body should contain "products"
    * Response Body should contain "id"
    * Response Body should contain "name"
    * Response Body should contain "price"