export function validatePassword(password) {
  const errors = [];
  if (!password || password.length < 8) {
    errors.push({ field: 'password', message: 'Password must be at least 8 characters' });
  }
  if (!/[A-Z]/.test(password)) {
    errors.push({ field: 'password', message: 'Password must contain at least one uppercase letter' });
  }
  if (!/[0-9]/.test(password)) {
    errors.push({ field: 'password', message: 'Password must contain at least one number' });
  }
  return errors;
}

export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export function validateSignup({ name, email, password }) {
  const errors = [];

  if (!name || name.trim().length < 2) {
    errors.push({ field: 'name', message: 'Name must be at least 2 characters' });
  }

  if (!email || !validateEmail(email)) {
    errors.push({ field: 'email', message: 'A valid email is required' });
  }

  const pwErrors = validatePassword(password);
  errors.push(...pwErrors);

  return errors;
}
