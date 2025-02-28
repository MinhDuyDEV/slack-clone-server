export const JWT_CONSTANTS = {
  ACCESS_TOKEN_EXPIRES_IN: '15m',
  REFRESH_TOKEN_EXPIRES_IN: '7d',
};

export const PASSWORD_CONSTANTS = {
  MIN_LENGTH: 8,
  MAX_LENGTH: 32,
  SALT_ROUNDS: 10,
};

export const VALIDATION_MESSAGES = {
  EMAIL_REQUIRED: 'Email is required',
  EMAIL_INVALID: 'Email is invalid',
  PASSWORD_REQUIRED: 'Password is required',
  PASSWORD_LENGTH: 'Password must be between 8 and 32 characters',
  NAME_REQUIRED: 'Full name is required',
};
