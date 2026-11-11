/**
 * FarmVeda Local Cryptographic Utilities
 *
 * Uses native Web Crypto API (SubtleCrypto) for SHA-256 hashing.
 * NOTE: As per project guidelines, this is a local demonstration
 * authentication layer for frontend-only browser storage.
 */

const LOCAL_DEMO_SALT = 'farmveda_demo_salt_2026_secure';

/**
 * Hash a password using SHA-256 with a local salt via Web Crypto API.
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${password}:${LOCAL_DEMO_SALT}`);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Verify a candidate password against an existing SHA-256 hash.
 */
export async function verifyPassword(password: string, expectedHash: string): Promise<boolean> {
  const computedHash = await hashPassword(password);
  return computedHash.toLowerCase() === expectedHash.toLowerCase();
}

/**
 * Detailed password strength validator matching project requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one number
 */
export interface PasswordValidationResult {
  isValid: boolean;
  hasMinLength: boolean;
  hasUpperCase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
  score: number; // 0 to 4
  strengthLabel: 'Too Weak' | 'Weak' | 'Medium' | 'Strong';
}

export function validatePasswordRequirements(password: string): PasswordValidationResult {
  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(password);

  let score = 0;
  if (hasMinLength) score += 1;
  if (hasUpperCase) score += 1;
  if (hasNumber) score += 1;
  if (hasSpecialChar) score += 1;

  let strengthLabel: 'Too Weak' | 'Weak' | 'Medium' | 'Strong' = 'Too Weak';
  if (score === 1) strengthLabel = 'Weak';
  else if (score === 2 || score === 3) strengthLabel = 'Medium';
  else if (score >= 4) strengthLabel = 'Strong';

  const isValid = hasMinLength && hasUpperCase && hasNumber;

  return {
    isValid,
    hasMinLength,
    hasUpperCase,
    hasNumber,
    hasSpecialChar,
    score,
    strengthLabel,
  };
}

/**
 * Validate standard email format.
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim().toLowerCase());
}

/**
 * Validate Indian mobile number (10 digits, optional country code prefix).
 */
export function validateMobile(mobile: string): boolean {
  const cleanMobile = mobile.replace(/[^0-9]/g, '');
  return cleanMobile.length === 10 || (cleanMobile.length === 12 && cleanMobile.startsWith('91'));
}

