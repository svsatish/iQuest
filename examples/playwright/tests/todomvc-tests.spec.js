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

test.describe("Debug TodoMVC Test", () => {
  test("Debug: Add todo with verbose output", async ({ page, context }) => {
    await page.goto("https://demo.playwright.dev/todomvc/");

    console.log("=== STARTING AGENT ===");
    const result = await runAgent(
      'On the web page, type "Buy groceries" in the input field and press Enter to add it as a new todo item',
      context,
      { verbose: true }
    );
    console.log("=== AGENT RESULT ===", result);

    // Wait a moment for any async operations
    await page.waitForTimeout(2000);

    // Check what's actually on the page
    const todoCount = await page.locator('.todo-list li').count();
    console.log(`Found ${todoCount} todos`);

    if (todoCount > 0) {
      const todoText = await page.locator('.todo-list li').first().textContent();
      console.log(`First todo text: ${todoText}`);
    }

    await expect(page.locator('.todo-list li')).toContainText("Buy groceries");
  });
});

test.describe("Add TodoMVC Test", () => {

  test("Add todo item", async ({ page, context }) => {
    await page.goto("https://demo.playwright.dev/todomvc/");
    // Wait a moment for any async operations
    await page.waitForTimeout(2000);
    // Agent adds todo item
    await runAgent(
      'Add a new todo item "Buy groceries" on the web page',
      context,
      { verbose: true }
    );

    // Test verifies it was added
    await expect(page.locator('.todo-list li')).toContainText("Buy groceries");
  });
});

test.describe("Complete TodoMVC Test", () => {

  test("Complete todo item", async ({ page, context }) => {
    await page.goto("https://demo.playwright.dev/todomvc/");
    // Wait a moment for any async operations
    await page.waitForTimeout(2000);
    // Test adds a todo first
    await page.locator('.new-todo').fill('Write project report');
    await page.locator('.new-todo').press('Enter');
    // Wait a moment for any async operations
    await page.waitForTimeout(2000);
    // Agent marks it as complete
    await runAgent(
      'Mark "Write project report" as completed on the web page',
      context,
      { verbose: true }
    );

    // Test verifies checkbox is checked
    const todoItem = page.locator('.todo-list li', { hasText: 'Write project report' });
    await expect(todoItem).toHaveClass(/completed/);
  });
});

test.describe("Filter TodoMVC Test", () => {

  test("Filter todos", async ({ page, context }) => {
    await page.goto("https://demo.playwright.dev/todomvc/");

    // Agent adds multiple todos
    await runAgent(
      'Add three todo items: "Task 1", "Task 2", and "Task 3" on the web page',
      context,
      { verbose: true }
    );

    // Test marks one as complete
    await page.locator('.todo-list li').first().locator('.toggle').check();

    // Agent filters to show only active todos
    await runAgent(
      'Click the Active filter to show only active todos on the web page',
      context,
      { verbose: true }
    );

    // Test verifies only 2 active todos are shown
    await expect(page.locator('.todo-list li')).toHaveCount(2);
  });
});

test.describe("Form Tests", () => {
  test("Fill and submit pizza order form", async ({ page, context }) => {
    await page.goto("https://httpbin.org/forms/post");

    // Agent fills the entire form
    await runAgent(
      'Fill in the pizza order form with: customer name "John Doe", telephone "555-0123", email "john@example.com", select Medium size, select Bacon topping, and fill delivery time as "18:00"',
      context,
      { verbose: true }
    );

    // Test verifies some fields are filled
    await expect(page.locator('input[name="custname"]')).toHaveValue("John Doe");
    await expect(page.locator('input[name="custtel"]')).toHaveValue("555-0123");

    // Agent submits the form
    await runAgent(
      'Submit the pizza order form',
      context,
      { verbose: true }
    );

    // Test verifies we're on the success page
    await expect(page).toHaveURL(/.*httpbin.org\/post/);
  });
});
