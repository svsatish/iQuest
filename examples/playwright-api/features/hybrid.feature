Feature: Hybrid smoke checks

  Scenario: Verify browser and API in one flow
    * Navigate to "data:text/html,<title>Hybrid Demo</title><h1>Hybrid Demo</h1>"
    * Should see "Hybrid Demo"
    * Call GET /health
    * Verify the response status is 200
    * Verify the JSON body has ok equal to true
