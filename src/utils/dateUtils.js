/**
 * Format date to YYYY-MM-DD
 * @param {string|Date} date - Date to format
 * @returns {string} - Formatted date
 */
export const formatDate = (date) => {
  if (!date) return '';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  
  // Check if date is valid
  if (isNaN(d.getTime())) return '';
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

/**
 * Format date to YYYY-MM-DD HH:MM
 * @param {string|Date} date - Date to format
 * @returns {string} - Formatted date with time
 */
export const formatDateTime = (date) => {
  if (!date) return '';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  
  // Check if date is valid
  if (isNaN(d.getTime())) return '';
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hour = String(d.getHours()).padStart(2, '0');
  const minute = String(d.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hour}:${minute}`;
};

/**
 * Get relative time description (today, yesterday, etc.)
 * @param {string|Date} date - Date to describe
 * @returns {string} - Relative time description
 */
export const getRelativeTimeDesc = (date) => {
  if (!date) return '';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  
  // Check if date is valid
  if (isNaN(d.getTime())) return '';
  
  // Clear time part for date comparison
  const dateWithoutTime = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const todayWithoutTime = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  // Calculate difference in days
  const diffTime = todayWithoutTime - dateWithoutTime;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return '今天';
  } else if (diffDays === 1) {
    return '昨天';
  } else {
    return formatDate(d);
  }
}; 