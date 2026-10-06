// Convert template day numbers to dated trip days before any database writes.
const importDays = (days, startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime()) || end < start) {
    throw Object.assign(new Error('Provide valid trip dates with end date on or after start date'), { status: 400 });
  }
  if (!Array.isArray(days)) {
    throw Object.assign(new Error('Itinerary days must be an array'), { status: 400 });
  }
  return days.map((day, index) => {
    const date = new Date(start);
    const offset = day.dayNumber === undefined ? index : Number(day.dayNumber) - 1;
    if (!Number.isInteger(offset) || offset < 0) {
      throw Object.assign(new Error('Day numbers must be positive integers'), { status: 400 });
    }
    date.setUTCDate(date.getUTCDate() + offset);
    const dayDate = day.date ? new Date(day.date) : date;
    if (!Number.isFinite(dayDate.getTime()) || dayDate < start || dayDate > end) {
      throw Object.assign(new Error('Itinerary days must fall within the trip dates'), { status: 400 });
    }
    return { ...day, date: dayDate.toISOString().slice(0, 10) };
  });
};

module.exports = { importDays };
