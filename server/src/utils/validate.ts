export const isValidEmail = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const isValidPassword = (password: string): boolean =>
  password.length >= 6;

export const isValidObjectId = (id: string): boolean =>
  /^[a-fA-F0-9]{24}$/.test(id);

export const isValidPAN = (pan: string): boolean =>
  /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan.toUpperCase());

export const sanitizeAmount = (value: unknown): number => {
  const num = Number(value);
  if (isNaN(num) || num <= 0) throw new Error('Invalid amount');
  return parseFloat(num.toFixed(2));
};