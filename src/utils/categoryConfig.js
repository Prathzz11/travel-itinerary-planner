/**
 * Central configuration for activity and expense categories.
 * Each entry maps to: { color, bgColor, emoji, label }
 * Used across Itinerary, Budget, and Browse pages for consistent icon/color coding.
 */

// Activity Categories
export const ACTIVITY_CATEGORIES = {
  Sightseeing:   { color: '#38bdf8', bgColor: 'rgba(56,189,248,0.15)',  emoji: '🏛️', label: 'Sightseeing' },
  Dining:        { color: '#f472b6', bgColor: 'rgba(244,114,182,0.15)', emoji: '🍽️', label: 'Dining' },
  Transport:     { color: '#60a5fa', bgColor: 'rgba(96,165,250,0.15)',  emoji: '🚌', label: 'Transport' },
  Accommodation: { color: '#a78bfa', bgColor: 'rgba(167,139,250,0.15)', emoji: '🏨', label: 'Accommodation' },
  Shopping:      { color: '#fb923c', bgColor: 'rgba(251,146,60,0.15)',  emoji: '🛍️', label: 'Shopping' },
  Entertainment: { color: '#facc15', bgColor: 'rgba(250,204,21,0.15)',  emoji: '🎭', label: 'Entertainment' },
  Sports:        { color: '#34d399', bgColor: 'rgba(52,211,153,0.15)',  emoji: '⚽', label: 'Sports' },
  Other:         { color: '#94a3b8', bgColor: 'rgba(148,163,184,0.15)', emoji: '📌', label: 'Other' },
};

// Expense Categories (superset of activity categories)
export const EXPENSE_CATEGORIES = {
  Accommodation: { color: '#a78bfa', bgColor: 'rgba(167,139,250,0.15)', emoji: '🏨', label: 'Accommodation' },
  Food:          { color: '#f472b6', bgColor: 'rgba(244,114,182,0.15)', emoji: '🍔', label: 'Food' },
  Transport:     { color: '#60a5fa', bgColor: 'rgba(96,165,250,0.15)',  emoji: '🚌', label: 'Transport' },
  Activities:    { color: '#38bdf8', bgColor: 'rgba(56,189,248,0.15)',  emoji: '🎯', label: 'Activities' },
  Shopping:      { color: '#fb923c', bgColor: 'rgba(251,146,60,0.15)',  emoji: '🛍️', label: 'Shopping' },
  Other:         { color: '#94a3b8', bgColor: 'rgba(148,163,184,0.15)', emoji: '📌', label: 'Other' },
};

// Trip Difficulty Levels
export const DIFFICULTY_LEVELS = {
  Easy:     { color: '#34d399', label: 'Easy',     emoji: '😊' },
  Moderate: { color: '#facc15', label: 'Moderate', emoji: '😅' },
  Hard:     { color: '#f87171', label: 'Hard',     emoji: '💪' },
  Extreme:  { color: '#ef4444', label: 'Extreme',  emoji: '🔥' },
};

// Member Roles
export const MEMBER_ROLES = {
  admin:  { label: 'Organizer', emoji: '👑', color: '#f59e0b', bgColor: 'rgba(245,158,11,0.15)',   description: 'Full access to manage trip and members' },
  editor: { label: 'Member',    emoji: '✈️', color: '#38bdf8', bgColor: 'rgba(56,189,248,0.15)',    description: 'Can add/edit itinerary and expenses' },
  viewer: { label: 'Viewer',    emoji: '👁️', color: '#94a3b8', bgColor: 'rgba(148,163,184,0.15)', description: 'View-only access to trip details' },
};

// Budget Status Thresholds
export const getBudgetStatus = (percent) => {
  if (percent >= 100) return { color: 'var(--color-danger)',  label: 'Over Budget',  bg: 'rgba(239,68,68,0.1)' };
  if (percent >= 75)  return { color: 'var(--color-warning)', label: 'Near Limit',   bg: 'rgba(245,158,11,0.1)' };
  return               { color: 'var(--color-success)', label: 'On Track',   bg: 'rgba(16,185,129,0.1)' };
};

// Trip Status
export const getTripStatus = (startDate, endDate) => {
  if (!startDate) return { label: 'Draft', color: '#94a3b8', bg: 'rgba(148,163,184,0.15)' };
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : null;
  if (start > today) return { label: 'Upcoming', color: '#38bdf8', bg: 'rgba(56,189,248,0.15)' };
  if (end && end < today) return { label: 'Past', color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' };
  return { label: 'Ongoing', color: '#34d399', bg: 'rgba(52,211,153,0.15)' };
};
