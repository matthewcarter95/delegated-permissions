export interface Product {
  id: string;
  priceId: string;
  name: string;
  description: string;
  mode: 'payment' | 'subscription';
  price: number;
  currency: string;
}

export const products: Product[] = [
  {
    id: 'prod_T0pt6q6RJiUG4q',
    priceId: 'price_1S4oDLCFuOLC6HH37l4DWsgW',
    name: 'Okta STIG Verification Workflows',
    description: 'Automates review of Okta tenant settings and reports findings where drift occurs.',
    mode: 'payment',
    price: 995000, // $9,950.00 in cents
    currency: 'usd'
  }
];

export function getProductById(id: string): Product | undefined {
  return products.find(product => product.id === id);
}

export function getProductByPriceId(priceId: string): Product | undefined {
  return products.find(product => product.priceId === priceId);
}

export function formatPrice(price: number, currency: string = 'usd'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(price / 100);
}