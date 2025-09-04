// Test currency formatting functions
import { formatCurrency, convertCurrency, CURRENCY_SYMBOLS } from './utils/currency.js';

// Test the currency formatting
console.log('Testing Currency Formatting:');
console.log('USD 1000:', formatCurrency(1000, 'USD'));
console.log('EUR 1000:', formatCurrency(1000, 'EUR'));
console.log('GBP 1000:', formatCurrency(1000, 'GBP'));
console.log('JPY 1000:', formatCurrency(1000, 'JPY'));

console.log('\nTesting Currency Conversion:');
console.log('1000 USD to EUR:', convertCurrency(1000, 'USD', 'EUR'));
console.log('1000 USD to GBP:', convertCurrency(1000, 'USD', 'GBP'));

console.log('\nCurrency Symbols:');
console.log('Available currencies:', Object.keys(CURRENCY_SYMBOLS));
