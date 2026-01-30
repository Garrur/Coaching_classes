import { addMonths, isBefore, differenceInDays } from 'date-fns';

/**
 * Calculate expiry date for pre-recorded courses (6 months from purchase)
 */
export function calculateExpiryDate(purchaseDate: Date): Date {
  return addMonths(purchaseDate, 6);
}

/**
 * Check if a course enrollment has expired
 */
export function isExpired(expiryDate: Date): boolean {
  return isBefore(expiryDate, new Date());
}

/**
 * Get days remaining until expiry
 */
export function getDaysRemaining(expiryDate: Date): number {
  return differenceInDays(expiryDate, new Date());
}

/**
 * Check if expiry warning should be sent (7 days before expiry)
 */
export function shouldSendExpiryWarning(expiryDate: Date): boolean {
  const daysRemaining = getDaysRemaining(expiryDate);
  return daysRemaining === 7;
}

/**
 * Format date for display
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

/**
 * Format time for display
 */
export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}
