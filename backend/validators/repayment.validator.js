/**
 * Repayment Submission Validation
 */
export const validateRepaymentSubmission = ({
  loanId,
  amount,
  paymentDate,
  idempotencyKey,
  paymentReference,
  notes,
}) => {
  if (!loanId) {
    return { isValid: false, error: 'Loan ID reference is required.' };
  }

  const numAmount = parseFloat(amount);
  if (isNaN(numAmount) || numAmount < 1) {
    return { isValid: false, error: 'Repayment amount must be at least 1.00.' };
  }

  if (!paymentDate) {
    return { isValid: false, error: 'Payment date is required.' };
  }

  const parsedDate = new Date(paymentDate);
  if (isNaN(parsedDate.getTime())) {
    return { isValid: false, error: 'Please enter a valid payment date.' };
  }

  // Prevent dates far in the future
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (parsedDate > tomorrow) {
    return { isValid: false, error: 'Payment date cannot be in the future.' };
  }

  if (!idempotencyKey || !idempotencyKey.trim()) {
    return { isValid: false, error: 'An idempotency key is required to safeguard against duplicate payments.' };
  }

  if (paymentReference && paymentReference.trim().length > 100) {
    return { isValid: false, error: 'Payment reference cannot exceed 100 characters.' };
  }

  if (notes && notes.trim().length > 500) {
    return { isValid: false, error: 'Notes cannot exceed 500 characters.' };
  }

  return { isValid: true };
};

