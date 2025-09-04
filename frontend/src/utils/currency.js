// Currency utility functions for the TrekTales application

// Currency symbols mapping
export const CURRENCY_SYMBOLS = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    CAD: 'C$',
    AUD: 'A$',
    CHF: 'CHF',
    CNY: '¥',
    INR: '₹',
    KRW: '₩',
    SGD: 'S$',
    HKD: 'HK$',
    THB: '฿',
    MXN: 'MX$',
    BRL: 'R$',
    RUB: '₽',
    ZAR: 'R',
    TRY: '₺',
    AED: 'د.إ',
    SAR: '﷼'
};

// Currency names mapping
export const CURRENCY_NAMES = {
    USD: 'US Dollar',
    EUR: 'Euro',
    GBP: 'British Pound',
    JPY: 'Japanese Yen',
    CAD: 'Canadian Dollar',
    AUD: 'Australian Dollar',
    CHF: 'Swiss Franc',
    CNY: 'Chinese Yuan',
    INR: 'Indian Rupee',
    KRW: 'South Korean Won',
    SGD: 'Singapore Dollar',
    HKD: 'Hong Kong Dollar',
    THB: 'Thai Baht',
    MXN: 'Mexican Peso',
    BRL: 'Brazilian Real',
    RUB: 'Russian Ruble',
    ZAR: 'South African Rand',
    TRY: 'Turkish Lira',
    AED: 'UAE Dirham',
    SAR: 'Saudi Riyal'
};

// Approximate exchange rates (in production, these should be fetched from a real API)
export const EXCHANGE_RATES = {
    USD: 1.0,      // Base currency
    EUR: 0.85,
    GBP: 0.73,
    JPY: 110.0,
    CAD: 1.25,
    AUD: 1.35,
    CHF: 0.92,
    CNY: 6.45,
    INR: 74.5,
    KRW: 1180.0,
    SGD: 1.35,
    HKD: 7.8,
    THB: 33.0,
    MXN: 20.0,
    BRL: 5.2,
    RUB: 75.0,
    ZAR: 14.5,
    TRY: 8.5,
    AED: 3.67,
    SAR: 3.75
};

/**
 * Get the currency symbol for a given currency code
 * @param {string} currencyCode - The currency code (e.g., 'USD', 'EUR')
 * @returns {string} The currency symbol
 */
export const getCurrencySymbol = (currencyCode) => {
    return CURRENCY_SYMBOLS[currencyCode] || currencyCode;
};

/**
 * Get the currency name for a given currency code
 * @param {string} currencyCode - The currency code (e.g., 'USD', 'EUR')
 * @returns {string} The currency name
 */
export const getCurrencyName = (currencyCode) => {
    return CURRENCY_NAMES[currencyCode] || currencyCode;
};

/**
 * Convert amount from USD to target currency
 * @param {number} usdAmount - Amount in USD
 * @param {string} targetCurrency - Target currency code
 * @returns {number} Converted amount
 */
export const convertFromUSD = (usdAmount, targetCurrency) => {
    if (!usdAmount || !targetCurrency) return 0;
    
    const rate = EXCHANGE_RATES[targetCurrency];
    if (!rate) return usdAmount;
    
    return usdAmount * rate;
};

/**
 * Convert amount from any currency to USD
 * @param {number} amount - Amount in source currency
 * @param {string} sourceCurrency - Source currency code
 * @returns {number} Amount in USD
 */
export const convertToUSD = (amount, sourceCurrency) => {
    if (!amount || !sourceCurrency) return 0;
    
    const rate = EXCHANGE_RATES[sourceCurrency];
    if (!rate) return amount;
    
    return amount / rate;
};

/**
 * Convert amount between any two currencies
 * @param {number} amount - Amount in source currency
 * @param {string} fromCurrency - Source currency code
 * @param {string} toCurrency - Target currency code
 * @returns {number} Converted amount
 */
export const convertCurrency = (amount, fromCurrency, toCurrency) => {
    if (!amount || fromCurrency === toCurrency) return amount;
    
    // Convert to USD first, then to target currency
    const usdAmount = convertToUSD(amount, fromCurrency);
    return convertFromUSD(usdAmount, toCurrency);
};

/**
 * Format amount with currency symbol
 * @param {number} amount - Amount to format
 * @param {string} currencyCode - Currency code
 * @param {boolean} showCode - Whether to show currency code alongside symbol
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currencyCode = 'USD', showCode = false) => {
    if (typeof amount !== 'number') return '0';
    
    const symbol = getCurrencySymbol(currencyCode);
    const formattedAmount = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    }).format(Math.round(amount));
    
    // Handle special formatting for different currencies
    switch (currencyCode) {
        case 'JPY':
        case 'KRW':
            // These currencies typically don't use decimal places
            const wholeAmount = Math.round(amount);
            return showCode ? `${symbol}${wholeAmount.toLocaleString()} ${currencyCode}` : `${symbol}${wholeAmount.toLocaleString()}`;
        
        case 'AED':
        case 'SAR':
            // Right-to-left currencies
            return showCode ? `${formattedAmount} ${symbol} ${currencyCode}` : `${formattedAmount} ${symbol}`;
        
        default:
            return showCode ? `${symbol}${formattedAmount} ${currencyCode}` : `${symbol}${formattedAmount}`;
    }
};

/**
 * Get formatted budget breakdown for different budget types
 * @param {object} baseCosts - Base costs in USD for budget/midRange/luxury
 * @param {string} targetCurrency - Target currency code
 * @returns {object} Formatted costs in target currency
 */
export const getFormattedBudgetBreakdown = (baseCosts, targetCurrency = 'USD') => {
    if (!baseCosts) return null;
    
    const result = {};
    
    Object.keys(baseCosts).forEach(budgetType => {
        if (typeof baseCosts[budgetType] === 'object') {
            result[budgetType] = {};
            Object.keys(baseCosts[budgetType]).forEach(category => {
                const usdAmount = baseCosts[budgetType][category];
                const convertedAmount = convertFromUSD(usdAmount, targetCurrency);
                result[budgetType][category] = convertedAmount;
            });
        }
    });
    
    return result;
};

/**
 * Get a user-friendly currency selection list
 * @returns {Array} Array of currency options for dropdowns
 */
export const getCurrencyOptions = () => {
    return Object.keys(CURRENCY_SYMBOLS).map(code => ({
        value: code,
        label: `${code} - ${CURRENCY_NAMES[code]} (${CURRENCY_SYMBOLS[code]})`,
        symbol: CURRENCY_SYMBOLS[code],
        name: CURRENCY_NAMES[code]
    }));
};

export default {
    getCurrencySymbol,
    getCurrencyName,
    convertFromUSD,
    convertToUSD,
    convertCurrency,
    formatCurrency,
    getFormattedBudgetBreakdown,
    getCurrencyOptions,
    CURRENCY_SYMBOLS,
    CURRENCY_NAMES,
    EXCHANGE_RATES
};
