Feature: Getting started

  Scenario: Check the API is alive
    * Call GET /health
    * Verify the response status is 200
    * Verify the JSON body has ok equal to true
