import { faker } from '@faker-js/faker';

export interface CustomerData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  note?: string;
}

export interface BillingData {
  firstName: string;
  lastName: string;
  company: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  email: string;
  phone: string;
}

export interface ShippingData {
  firstName: string;
  lastName: string;
  company: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  email: string;
  phone: string;
}

export interface ProductData {
  name: string;
  price: number;
  description: string;
  category: string;
}

export class TestDataGenerator {
  static generateCustomerData(): CustomerData {
    return {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email(),
      phone: faker.phone.number(),
      note: faker.lorem.sentence(),
    };
  }

  static generateBillingData(): BillingData {
    return {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      company: faker.company.name(),
      address1: faker.location.streetAddress(),
      address2: faker.location.secondaryAddress(),
      city: faker.location.city(),
      state: faker.location.state(),
      postcode: faker.location.zipCode(),
      country: 'Bangladesh',
      email: faker.internet.email(),
      phone: faker.phone.number(),
    };
  }

  static generateShippingData(): ShippingData {
    return {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      company: faker.company.name(),
      address1: faker.location.streetAddress(),
      address2: faker.location.secondaryAddress(),
      city: faker.location.city(),
      state: faker.location.state(),
      postcode: faker.location.zipCode(),
      country: 'Bangladesh',
      email: faker.internet.email(),
      phone: faker.phone.number(),
    };
  }

  static generateProductData(): ProductData {
    return {
      name: faker.commerce.productName(),
      price: parseFloat(faker.commerce.price()),
      description: faker.commerce.productDescription(),
      category: faker.commerce.department(),
    };
  }

  // Predefined test data for consistent testing
  static getTestCustomer(): CustomerData {
    return {
      firstName: 'Test',
      lastName: 'Customer',
      email: 'test.customer@example.com',
      phone: '01705139111',
      note: 'Test order for automation',
    };
  }

  static getTestBilling(): BillingData {
    return {
      firstName: 'Test',
      lastName: 'Customer',
      company: 'Test Company',
      address1: 'Test Address 1',
      address2: 'Test Address 2',
      city: 'Dhaka',
      state: 'Dhaka',
      postcode: '1212',
      country: 'Bangladesh',
      email: 'test.customer@example.com',
      phone: '01705139111',
    };
  }

  static getTestShipping(): ShippingData {
    return {
      firstName: 'Test',
      lastName: 'Shipping',
      company: 'Test Shipping Company',
      address1: 'Test Shipping Address 1',
      address2: 'Test Shipping Address 2',
      city: 'Sirajganj',
      state: 'Dhaka',
      postcode: '1212',
      country: 'Bangladesh',
      email: 'test.shipping@example.com',
      phone: '01701026708',
    };
  }

  static getTestProducts(): string[] {
    return [
      'Football Net',
      'Basketball',
      'Tennis Racket',
      'Cricket Bat',
      'Soccer Ball',
    ];
  }

  static getRandomTestProduct(): string {
    const products = this.getTestProducts();
    return products[Math.floor(Math.random() * products.length)] || 'Football Net';
  }
} 