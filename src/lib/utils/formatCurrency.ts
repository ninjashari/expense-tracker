import { CURRENCIES } from '../types';

/**
 * Gets the currency symbol for a given currency code
 */
export function getCurrencySymbol(currencyCode: string): string {
  const currency = CURRENCIES.find(c => c.code === currencyCode);
  if (!currency) return '$'; // Default fallback
  
  // Extract symbol from the name (format is "Name (Symbol)")
  const match = currency.name.match(/\(([^)]+)\)/);
  return match ? match[1] : '$';
}

/**
 * Formats a number as currency with the appropriate symbol
 */
export function formatCurrency(amount: number, currencyCode: string): string {
  const symbol = getCurrencySymbol(currencyCode);
  
  return `${symbol}${amount.toFixed(2)}`;
} 