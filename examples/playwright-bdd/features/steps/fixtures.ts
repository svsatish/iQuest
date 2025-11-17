import { test as base, createBdd } from 'playwright-bdd';

type Fixtures = {
  // Add custom fixtures here if needed
};

export const test = base.extend<Fixtures>({
  // Add custom fixture implementations here if needed
});

//export const { Given, When, Then } = createBdd(test);
export const { Step: aistep } = createBdd(test);
