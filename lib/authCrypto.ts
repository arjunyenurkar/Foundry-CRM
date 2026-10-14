import crypto from 'crypto';

/**
 * Hash password using SHA-256 with a consistent salt
 */
export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + '_truform_salt_2026').digest('hex');
}

/**
 * Verify password against stored hash or fallback to legacy standard sha256
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash) return false;
  
  // Standard salted hash
  const computedWithSalt = hashPassword(password);
  if (computedWithSalt === storedHash) return true;

  // Direct hex hash (matches ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f)
  const directHash = crypto.createHash('sha256').update(password).digest('hex');
  if (directHash === storedHash) return true;

  // Allow standard password match if stored directly as fallback
  if (storedHash === password) return true;

  return false;
}
