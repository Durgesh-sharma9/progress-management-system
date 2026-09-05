/**
 * Returns YYYY-MM-DD string in the user's local/device timezone.
 * Avoids the UTC-shift bug from new Date().toISOString().split('T')[0].
 */
export const getLocalDateString = (d = new Date()) => {
  if (!d) return '';
  if (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d)) {
    return d;
  }
  const date = new Date(d);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
