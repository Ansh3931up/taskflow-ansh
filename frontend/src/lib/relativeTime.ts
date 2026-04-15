/**
 * Human-readable distance from `date` to now (past-oriented, for "created … ago" UI).
 * Replaces `date-fns/formatDistanceToNow` without pulling date-fns.
 */
export function formatDistanceToNow(date: Date, options?: { addSuffix?: boolean }): string {
  const now = Date.now();
  const then = date.getTime();
  const addSuffix = options?.addSuffix ?? false;

  if (then > now) {
    return addSuffix ? 'just now' : 'less than a minute';
  }

  const diffSec = Math.floor((now - then) / 1000);
  const minutes = Math.floor(diffSec / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  let result: string;
  if (diffSec < 45) {
    result = 'less than a minute';
  } else if (minutes < 1) {
    result = 'about 1 minute';
  } else if (minutes < 60) {
    result = `${minutes} minute${minutes === 1 ? '' : 's'}`;
  } else if (hours < 24) {
    result = hours === 1 ? 'about 1 hour' : `about ${hours} hours`;
  } else if (days < 30) {
    result = days === 1 ? '1 day' : `${days} days`;
  } else if (months < 12) {
    result = months === 1 ? 'about 1 month' : `about ${months} months`;
  } else {
    result = years === 1 ? 'about 1 year' : `about ${years} years`;
  }

  return addSuffix ? `${result} ago` : result;
}
