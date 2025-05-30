// Time utilities for relative time formatting with i18n support

export const formatRelativeTime = (timestamp, t) => {
  const now = Date.now();
  const diffMs = now - timestamp;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  // Just now (under 1 minute)
  if (diffSeconds < 60) {
    return t('time.justNow');
  }
  
  // Minutes ago (1-59 minutes)
  if (diffMinutes < 60) {
    return t('time.minutesAgo', { count: diffMinutes });
  }
  
  // Hours ago (1-23 hours)
  if (diffHours < 24) {
    return t('time.hoursAgo', { count: diffHours });
  }
  
  // Days ago (1-6 days)
  if (diffDays < 7) {
    return t('time.daysAgo', { count: diffDays });
  }
  
  // More than a week - show actual date
  const date = new Date(timestamp);
  return date.toLocaleDateString();
};

// Convert legacy string-based history to object-based history
export const migrateHistoryData = (historyArray) => {
  if (!Array.isArray(historyArray)) {
    return [];
  }
  
  return historyArray.map((item, index) => {
    // If it's already an object with timestamp, return as-is
    if (typeof item === 'object' && item.term && item.timestamp) {
      return item;
    }
    
    // If it's a string, convert to object with estimated timestamp
    if (typeof item === 'string') {
      // Estimate timestamp based on index (older items have lower index)
      // Assume each item was created 10 minutes before the previous one
      const estimatedTimestamp = Date.now() - (index * 10 * 60 * 1000);
      return {
        term: item,
        timestamp: estimatedTimestamp
      };
    }
    
    return null;
  }).filter(Boolean);
};

// Create a new history item with current timestamp
export const createHistoryItem = (term) => {
  return {
    term: term.trim(),
    timestamp: Date.now()
  };
};
