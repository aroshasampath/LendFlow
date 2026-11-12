import validator from 'validator';

/**
 * Validate user registration payload.
 * Returns { isValid: boolean, error?: string }
 */
export const validateRegistration = ({
  fullName,
  username,
  email,
  phoneNumber,
  password,
  confirmPassword,
}) => {
  if (!fullName || !username || !email || !phoneNumber || !password || !confirmPassword) {
    return { isValid: false, error: 'Please complete all required fields.' };
  }

  if (fullName.trim().length < 2) {
    return { isValid: false, error: 'Full name must be at least 2 characters.' };
  }

  if (!/^[a-zA-Z0-9_]{3,30}$/.test(username.trim())) {
    return {
      isValid: false,
      error: 'Username must be 3-30 characters long and contain only letters, numbers, and underscores.',
    };
  }

  if (!validator.isEmail(email.trim())) {
    return { isValid: false, error: 'Please enter a valid email address.' };
  }

  if (!/^\+?[0-9\s\-()]{7,20}$/.test(phoneNumber.trim())) {
    return { isValid: false, error: 'Please enter a valid phone number.' };
  }

  // Password strength: min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_\-+=~`[\]{}|\\:;"'<>,.?/]).{8,}$/;
  if (!passwordRegex.test(password)) {
    return {
      isValid: false,
      error:
        'Please choose a stronger password. It must be at least 8 characters long and contain an uppercase letter, lowercase letter, number, and special character.',
    };
  }

  if (password !== confirmPassword) {
    return { isValid: false, error: 'Passwords do not match. Please verify and try again.' };
  }

  return { isValid: true };
};

/**
 * Validate password change payload.
 */
export const validatePasswordChange = ({ currentPassword, newPassword, confirmNewPassword }) => {
  if (!currentPassword || !newPassword || !confirmNewPassword) {
    return { isValid: false, error: 'Please complete all required fields.' };
  }

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_\-+=~`[\]{}|\\:;"'<>,.?/]).{8,}$/;
  if (!passwordRegex.test(newPassword)) {
    return {
      isValid: false,
      error:
        'Please choose a stronger password. It must be at least 8 characters long and contain an uppercase letter, lowercase letter, number, and special character.',
    };
  }

  if (newPassword !== confirmNewPassword) {
    return { isValid: false, error: 'New passwords do not match. Please check and try again.' };
  }

  if (currentPassword === newPassword) {
    return { isValid: false, error: 'New password must be different from your current password.' };
  }

  return { isValid: true };
};

