Feature: Hybrid UI + API testing

  Scenario: Create user via API, then verify in UI
    * Call POST "/api/users" with body { "email": "test@example.com", "password": "secret123" }
    * Verify the response status is 201
    * Verify the JSON body has "id" equal to a non-empty string
    * Navigate to "/login"
    * Fill "email" with "test@example.com"
    * Fill "password" with "secret123"
    * Click "Submit"
    * Should see "Welcome, test@example.com"

  Scenario: Verify API health from UI
    * Navigate to "data:text/html,<title>API Demo</title><h1>API Demo</h1><button id='check'>Check API</button>"
    * Click "Check API"
    * Call GET "/health"
    * Verify the response status is 200
    * Verify the JSON body has "ok" equal to true