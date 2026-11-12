/**
 * Financial Currency & Minor-Unit Math Utility
 * Prevents IEEE 754 floating-point inaccuracies by storing currency in integer minor units (e.g. cents).
 */

/**
 * Convert standard currency amount (e.g. 100.50) to integer minor units (e.g. 10050)
 */
export const toMinorUnits = (amount) => {
  if (typeof amount !== 'number' && typeof amount !== 'string') return 0;
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return 0;
  return Math.round(num * 100);
};

/**
 * Convert integer minor units (e.g. 10050) to standard floating currency (e.g. 100.50)
 */
export const toMajorUnits = (minorUnits) => {
  if (typeof minorUnits !== 'number') return 0;
  return Number((minorUnits / 100).toFixed(2));
};

/**
 * Format minor units into clean localized currency string (e.g. "$1,250.00")
 */
export const formatCurrency = (minorUnits, currency = 'USD') => {
  const major = toMajorUnits(minorUnits);
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
      minimumFractionDigits: 2,
    }).format(major);
  } catch {
    return `${currency.toUpperCase()} ${major.toFixed(2)}`;
  }
};

