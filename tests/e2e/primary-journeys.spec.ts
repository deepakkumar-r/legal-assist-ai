import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('sample lease can be analyzed and passes automated accessibility checks', async ({ page }) => {
  await page.route('**/api/analyze', async (route) =>
    route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({
        documentId: 'dffb9fd6-5775-4e31-a79a-80f30338ea03',
        analysis: {
          documentType: 'Residential Lease Agreement',
          overview: 'A fixed-term residential lease with renewal and early-termination terms.',
          sections: [],
          clauses: [],
        },
      }),
    }),
  );
  await page.goto('/');
  const accessibility = await new AxeBuilder({ page }).analyze();
  expect(accessibility.violations).toEqual([]);

  await page.getByRole('button', { name: /try a sample lease/i }).click();
  await page.getByRole('button', { name: /make this clear/i }).click();
  await expect(page.getByText(/analysis complete/i)).toBeVisible({ timeout: 30_000 });
  await expect(page.getByRole('heading', { name: /agreement/i })).toBeVisible();
});

test('comparison journey shows material differences', async ({ page }) => {
  await page.route('**/api/compare', async (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        comparison: {
          overview: 'Document B increases the monthly rent.',
          items: [
            {
              topic: 'Monthly rent',
              documentA: '$1,800',
              documentB: '$2,000',
              change: 'Rent increases by $200.',
              materiality: 'medium',
              reason: 'This changes the recurring payment obligation.',
            },
          ],
        },
      }),
    }),
  );
  await page.goto('/');
  await page.getByRole('tab', { name: /compare/i }).click();
  await page.getByLabel('Document title').fill('Lease A');
  await page
    .getByLabel('Document text')
    .fill('Section 1. Rent\n\nTenant pays $1,800 monthly. '.repeat(5));
  await page
    .getByLabel('Second document')
    .fill('Section 1. Rent\n\nTenant pays $2,000 monthly. '.repeat(5));
  await page.getByRole('button', { name: /compare documents/i }).click();
  await expect(page.getByText(/comparison complete/i)).toBeVisible({ timeout: 30_000 });
});
