export const formatDate = (date) => new Date(date).toLocaleDateString();
export const formatCurrency = (amount, curr='INR') => new Intl.NumberFormat('en-IN', {style:'currency', currency:curr}).format(amount);
export const calculateDuration = (start, end) => 1;
export const getInitials = (name) => name.substring(0, 2).toUpperCase();
export const slugify = (text) => text.toLowerCase().replace(/\s+/g, '-');