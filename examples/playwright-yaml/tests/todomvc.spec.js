// Auto-generated from todomvc.spec.yaml
// DO NOT EDIT - changes will be overwritten on next generate
// Edit the YAML file instead and run: npx openqa generate

import { test } from '@playwright/test';
import { runAgent } from 'openqa';

test.describe('TodoMVC Tests', () => {
  test.describe.configure({
    timeout: 180000,
  });

  test('Add a todo item @smoke', async ({ page, context }) => {
    await test.step('Navigate to the home page', async () => {
      await runAgent('Navigate to the home page', context, { verbose: true });
    });
    await test.step('Add a new todo item "Buy groceries"', async () => {
      await runAgent('Add a new todo item "Buy groceries"', context, { verbose: true });
    });
    await test.step('Verify that "Buy groceries" appears in the todo list', async () => {
      await runAgent('Verify that "Buy groceries" appears in the todo list', context, { verbose: true });
    });
  });

  test('Complete a todo item', async ({ page, context }) => {
    await test.step('Navigate to the home page', async () => {
      await runAgent('Navigate to the home page', context, { verbose: true });
    });
    await test.step('Type "Write project report" in the new todo input and press Enter', async () => {
      await runAgent('Type "Write project report" in the new todo input and press Enter', context, { verbose: true });
    });
    await test.step('Mark "Write project report" as completed', async () => {
      await runAgent('Mark "Write project report" as completed', context, { verbose: true });
    });
    await test.step('Verify that "Write project report" has the completed class', async () => {
      await runAgent('Verify that "Write project report" has the completed class', context, { verbose: true });
    });
  });

  test('Filter todos', async ({ page, context }) => {
    await test.step('Navigate to the home page', async () => {
      await runAgent('Navigate to the home page', context, { verbose: true });
    });
    await test.step('Add three todo items "Task 1", "Task 2", and "Task 3"', async () => {
      await runAgent('Add three todo items "Task 1", "Task 2", and "Task 3"', context, { verbose: true });
    });
    await test.step('Mark the first todo as completed', async () => {
      await runAgent('Mark the first todo as completed', context, { verbose: true });
    });
    await test.step('Click the Active filter to show only active todos', async () => {
      await runAgent('Click the Active filter to show only active todos', context, { verbose: true });
    });
    await test.step('Verify that only 2 active todos are shown', async () => {
      await runAgent('Verify that only 2 active todos are shown', context, { verbose: true });
    });
  });

});
