// Currency utility functions for the travel app

// Exchange rates (in a real app, these would come from an API)
const EXCHANGE_RATES = {
  USD: 1,
  EUR: 0.85,
  GBP: 0.73,
  JPY: 110,
  CAD: 1.25,
  AUD: 1.35,
  INR: 74.5,
  CHF: 0.92,
  CNY: 6.45,
  KRW: 1180,
  SGD: 1.35,
  THB: 33.5,
  MXN: 20.5,
  BRL: 5.2,
  ZAR: 14.8,
  NZD: 1.42,
  SEK: 8.6,
  NOK: 8.8,
  DKK: 6.3,
  PLN: 3.9,
  CZK: 21.8,
  HUF: 295,
  RUB: 73.5,
  TRY: 8.5,
  AED: 3.67,
  SAR: 3.75,
  QAR: 3.64,
  KWD: 0.30,
  BHD: 0.38,
  OMR: 0.38,
  EGP: 15.7,
  MAD: 9.0,
  TND: 2.8,
  ILS: 3.2,
  LBP: 1507,
  JOD: 0.71
};

// Currency symbols
const CURRENCY_SYMBOLS = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  CAD: 'C$',
  AUD: 'A$',
  INR: '₹',
  CHF: 'CHF',
  CNY: '¥',
  KRW: '₩',
  SGD: 'S$',
  THB: '฿',
  MXN: '$',
  BRL: 'R$',
  ZAR: 'R',
  NZD: 'NZ$',
  SEK: 'kr',
  NOK: 'kr',
  DKK: 'kr',
  PLN: 'zł',
  CZK: 'Kč',
  HUF: 'Ft',
  RUB: '₽',
  TRY: '₺',
  AED: 'د.إ',
  SAR: '﷼',
  QAR: '﷼',
  KWD: 'د.ك',
  BHD: '.د.ب',
  OMR: '﷼',
  EGP: '£',
  MAD: 'د.م.',
  TND: 'د.ت',
  ILS: '₪',
  LBP: '£',
  JOD: 'د.ا'
};

// Get user's preferred currency from localStorage
export const getUserCurrency = () => {
  return localStorage.getItem('preferredCurrency') || 'USD';
};

// Set user's preferred currency
export const setUserCurrency = (currency) => {
  localStorage.setItem('preferredCurrency', currency);
};

// Convert amount from USD to target currency
export const convertFromUSD = (amountInUSD, targetCurrency = null) => {
  if (!amountInUSD || amountInUSD === 0) return 0;
  
  const currency = targetCurrency || getUserCurrency();
  const rate = EXCHANGE_RATES[currency] || 1;
  
  return amountInUSD * rate;
};

// Convert amount from any currency to USD
export const convertToUSD = (amount, sourceCurrency) => {
  if (!amount || amount === 0) return 0;
  
  const rate = EXCHANGE_RATES[sourceCurrency] || 1;
  return amount / rate;
};

// Convert between any two currencies
export const convertCurrency = (amount, fromCurrency, toCurrency) => {
  // Convert to USD first, then to target currency
  const amountInUSD = convertToUSD(amount, fromCurrency);
  return convertFromUSD(amountInUSD, toCurrency);
};

// Format currency with proper symbol and formatting
export const formatCurrency = (amount, currency = null, options = {}) => {
  const {
    showSymbol = true,
    showCode = false,
    decimals = 2,
    locale = 'en-US'
  } = options;
  
  const targetCurrency = currency || getUserCurrency();
  const symbol = CURRENCY_SYMBOLS[targetCurrency] || '$';
  
  // Format the number with proper decimals
  const formattedAmount = new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(amount);
  
  if (showCode) {
    return `${formattedAmount} ${targetCurrency}`;
  }
  
  if (showSymbol) {
    return `${symbol}${formattedAmount}`;
  }
  
  return formattedAmount;
};

// Format price with conversion from USD
export const formatPrice = (priceInUSD, targetCurrency = null, options = {}) => {
  const currency = targetCurrency || getUserCurrency();
  const convertedAmount = convertFromUSD(priceInUSD, currency);
  return formatCurrency(convertedAmount, currency, options);
};

// Get currency symbol
export const getCurrencySymbol = (currency) => {
  return CURRENCY_SYMBOLS[currency] || '$';
};

// Get all available currencies
export const getAvailableCurrencies = () => {
  return Object.keys(EXCHANGE_RATES).map(code => ({
    code,
    symbol: CURRENCY_SYMBOLS[code] || code,
    rate: EXCHANGE_RATES[code]
  }));
};

// Get popular currencies for quick selection
export const getPopularCurrencies = () => {
  const popular = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'INR', 'CHF'];
  return popular.map(code => ({
    code,
    symbol: CURRENCY_SYMBOLS[code] || code,
    rate: EXCHANGE_RATES[code]
  }));
};

// Update exchange rates (placeholder for API integration)
export const updateExchangeRates = async () => {
  try {
    // In a real app, you would fetch from an API like:
    // const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    // const data = await response.json();
    // Update EXCHANGE_RATES with data.rates
    console.log('Exchange rates updated');
    return true;
  } catch (error) {
    console.error('Failed to update exchange rates:', error);
    return false;
  }
};

// Default export for convenience
export default {
  getUserCurrency,
  setUserCurrency,
  convertFromUSD,
  convertToUSD,
  convertCurrency,
  formatCurrency,
  formatPrice,
  getCurrencySymbol,
  getAvailableCurrencies,
  getPopularCurrencies,
  updateExchangeRates
};
