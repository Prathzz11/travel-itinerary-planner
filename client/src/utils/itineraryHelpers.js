import { format, differenceInDays, parseISO } from 'date-fns';

export function formatDuration(startDate, endDate) {
  if (!startDate || !endDate) return '';
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
  const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
  const days = differenceInDays(end, start) + 1;
  return `${days} day${days !== 1 ? 's' : ''}`;
}

export function formatBudget(amount, currency = 'USD') {
  if (amount === null || amount === undefined) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date) {
  if (!date) return '';
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'MMM d, yyyy');
}

export function getAvatarInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function truncateText(text, maxLen = 100) {
  if (!text) return '';
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen).trimEnd() + '...';
}

export function getDurationDays(startDate, endDate) {
  if (!startDate || !endDate) return 0;
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
  const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
  return Math.max(0, differenceInDays(end, start) + 1);
}

export function calculateBudgetPerDay(total, days) {
  if (!days || days === 0) return 0;
  return Math.round(total / days);
}

export function formatRating(rating) {
  if (rating === null || rating === undefined) return '0.0';
  return Number(rating).toFixed(1);
}

export function getCategoryIcon(type) {
  const icons = {
    accommodation: '🏨',
    hotel: '🏨',
    transport: '✈️',
    flight: '✈️',
    train: '🚆',
    bus: '🚌',
    car: '🚗',
    food: '🍽️',
    restaurant: '🍽️',
    activity: '🎯',
    sightseeing: '🏛️',
    shopping: '🛍️',
    entertainment: '🎭',
    nature: '🌿',
    beach: '🏖️',
    hiking: '🥾',
    museum: '🏛️',
    default: '📍',
  };
  if (!type) return icons.default;
  const key = type.toLowerCase();
  return icons[key] || icons.default;
}

export function sortItineraries(list, sortBy) {
  if (!Array.isArray(list)) return [];
  const arr = [...list];
  switch (sortBy) {
    case 'rating':
      return arr.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
    case 'popularity':
      return arr.sort((a, b) => (b.forkCount || 0) - (a.forkCount || 0));
    case 'date':
      return arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    case 'trending':
      return arr.sort(
        (a, b) =>
          ((b.forkCount || 0) * 0.6 + (b.reviewCount || 0) * 0.4) -
          ((a.forkCount || 0) * 0.6 + (a.reviewCount || 0) * 0.4)
      );
    default:
      return arr;
  }
}
