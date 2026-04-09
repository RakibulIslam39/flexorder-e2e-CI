import { test, expect } from '@playwright/test';
import { TestDataGenerator } from '../test-data/test-data';

test.describe('TestDataGenerator', () => {
  test('returns stable predefined customer and billing data', () => {
    expect(TestDataGenerator.getTestCustomer()).toEqual({
      firstName: 'Test',
      lastName: 'Customer',
      email: 'test.customer@example.com',
      phone: '01705139111',
      note: 'Test order for automation',
    });

    expect(TestDataGenerator.getTestBilling().country).toBe('Bangladesh');
    expect(TestDataGenerator.getTestShipping().city).toBe('Sirajganj');
  });

  test('returns a product from the predefined product list', () => {
    const products = TestDataGenerator.getTestProducts();
    const product = TestDataGenerator.getRandomTestProduct();

    expect(products.length).toBeGreaterThan(0);
    expect(products).toContain(product);
  });

  test('falls back to default product when list is empty', () => {
    const customGenerator = {
      getTestProducts: () => [],
    };

    const product = TestDataGenerator.getRandomTestProduct.call(customGenerator as any);
    expect(product).toBe('Football Net');
  });
});
