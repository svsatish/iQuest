import { test, expect } from "@playwright/test";
import { runAgent } from "openqa";

/**
 * TodoMVC and Form Tests
 *
 * Demonstrates AI agent automation with:
 * - 3 TodoMVC tests (add, complete, filter)
 * - 1 httpbin form test
 * - Parallel execution (4 tests)
 * - Shared browser context between test and agent
 * - Uses unified agent interface (defaults to Claude, configurable via AGENT_TYPE env var)
 */

test.describe("TodoMVC and Form Automation", () => {
  test("Add todo item", async ({ page, context }) => {
    await runAgent('Navigate to "https://demo.playwright.dev/todomvc/"', context);
    await runAgent('Add a new todo item "Buy groceries" on the web page', context);
    await runAgent('Verify that "Buy groceries" is in the todo list', context);
  });

  test("Complete todo item", async ({ page, context }) => {
    await runAgent('Navigate to "https://demo.playwright.dev/todomvc/"', context);
    await runAgent('Add a new todo item with text "Complete this task"', context);
    await runAgent('Mark "Complete this task" as completed on the web page', context);
    await runAgent('Verify that the todo "Complete this task" is marked as completed', context);
  });

  test("Filter todos", async ({ page, context }) => {
    await runAgent('Navigate to "https://demo.playwright.dev/todomvc/"', context);
    await runAgent('Add three todo items: "Task 1", "Task 2", and "Task 3" on the web page', context);
    await runAgent('Mark the first todo as completed', context);
    await runAgent('Click the Active filter to show only active todos on the web page', context);
    await runAgent('Verify that there are 2 active todos', context);
  });

  test("Fill and submit pizza order form", async ({ page, context }) => {
    await runAgent('Navigate to "https://httpbin.org/forms/post"', context);
    await runAgent('Fill in the pizza order form with customer name "John Doe", telephone "555-0123", email "john@example.com", select Medium size, select Bacon topping, and fill delivery time as "18:00"', context);
    await runAgent('Submit the pizza order form', context);
    await runAgent('Verify that the success page is displayed', context);
  });
});

