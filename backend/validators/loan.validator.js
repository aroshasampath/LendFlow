/**
 * Loan Creation Payload Validation
 */
export const validateLoanCreation = ({
  borrowerIdentifier,
  amount,
  currency,
  dueDate,
  repaymentFrequency,
  description,
}) => {
  if (!borrowerIdentifier || !borrowerIdentifier.trim()) {
    return { isValid: false, error: 'Please specify the borrower for this loan request.' };
  }

  const numAmount = parseFloat(amount);
  if (isNaN(numAmount) || numAmount < 1) {
    return { isValid: false, error: 'Loan principal amount must be at least 1.00.' };
  }

  const allowedCurrencies = ['USD', 'LKR', 'EUR', 'GBP'];
  if (currency && !allowedCurrencies.includes(currency.toUpperCase())) {
    return { isValid: false, error: 'Please choose a supported currency (USD, LKR, EUR, GBP).' };
  }

  if (!dueDate) {
    return { isValid: false, error: 'Please specify a repayment due date.' };
  }

  const parsedDueDate = new Date(dueDate);
  if (isNaN(parsedDueDate.getTime())) {
    return { isValid: false, error: 'Please enter a valid due date.' };
  }

  if (parsedDueDate <= new Date()) {
    return { isValid: false, error: 'Due date must be in the future.' };
  }

  const allowedFrequencies = ['one-time', 'weekly', 'bi-weekly', 'monthly'];
  if (repaymentFrequency && !allowedFrequencies.includes(repaymentFrequency)) {
    return { isValid: false, error: 'Please select a valid repayment frequency.' };
  }

  if (!description || !description.trim()) {
    return { isValid: false, error: 'Please provide a brief description for this loan.' };
  }

  if (description.trim().length > 300) {
    return { isValid: false, error: 'Description cannot exceed 300 characters.' };
  }

  return { isValid: true };
};
