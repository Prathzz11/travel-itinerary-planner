function tripDays(startDate, endDate, existing = []) {
  const start = new Date(startDate), end = new Date(endDate);
  if (!Number.isFinite(+start) || !Number.isFinite(+end) || end < start) throw Object.assign(new Error('Invalid trip date range'), { status: 400 });
  const first = start.toISOString().slice(0,10), last = end.toISOString().slice(0,10);
  if (existing.some(day => (day.date < first || day.date > last) && day.activities.length)) {
    throw Object.assign(new Error('Move or remove activities outside the new dates before shortening the trip'), { status: 400 });
  }
  const byDate = new Map(existing.map(day => [day.date, day]));
  const result = [];
  for (const date = new Date(first); date <= end; date.setUTCDate(date.getUTCDate() + 1)) {
    const key = date.toISOString().slice(0,10);
    result.push(byDate.get(key) || { date: key, activities: [] });
  }
  return result;
}
module.exports = { tripDays };
