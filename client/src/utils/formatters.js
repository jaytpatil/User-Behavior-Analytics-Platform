/**
 * Format ISO date string into readable local date and time
 */
export const formatDate = (isoString) => {
  if (!isoString) return '—';
  try {
    const d = new Date(isoString);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return isoString;
  }
};

/**
 * Format relative time (e.g. "5 mins ago")
 */
export const formatRelativeTime = (isoString) => {
  if (!isoString) return '—';
  const diffMs = Date.now() - new Date(isoString).getTime();
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  const diffDays = Math.floor(diffHour / 24);
  return `${diffDays}d ago`;
};

/**
 * Format duration in seconds (e.g. "2m 45s")
 */
export const formatDuration = (seconds) => {
  if (seconds === undefined || seconds === null) return '—';
  const sec = Math.max(0, Math.round(seconds));
  if (sec < 60) return `${sec}s`;
  const mins = Math.floor(sec / 60);
  const remainingSec = sec % 60;
  if (mins < 60) return `${mins}m ${remainingSec}s`;
  const hours = Math.floor(mins / 60);
  return `${hours}h ${mins % 60}m`;
};

/**
 * Shorten a session ID for clean table presentation
 */
export const truncateId = (id, maxLen = 14) => {
  if (!id) return '';
  if (id.length <= maxLen) return id;
  return `${id.slice(0, 8)}...${id.slice(-4)}`;
};

/**
 * Extract clean pathname from full URL for cleaner label
 */
export const formatUrlPath = (fullUrl) => {
  if (!fullUrl) return '';
  try {
    const parsed = new URL(fullUrl);
    return parsed.pathname + (parsed.search || '');
  } catch {
    return fullUrl;
  }
};
