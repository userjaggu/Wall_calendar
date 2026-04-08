export function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

export function getFirstDayOfWeek(year, month) {
  const d = new Date(year, month, 1).getDay();
  return d === 0 ? 6 : d - 1; // Monday = 0
}

export function sameDay(a, b) {
  return (
    a && b &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function inRange(d, start, end) {
  if (!start || !end) return false;
  const [lo, hi] = start <= end ? [start, end] : [end, start];
  return d > lo && d < hi;
}

export function daysBetween(a, b) {
  if (!a || !b) return 0;
  return Math.abs(Math.round((b - a) / 86_400_000));
}

export function formatDate(d, style = "long") {
  if (!d) return "";
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  if (style === "short") return `${d.getDate()} ${months[d.getMonth()]}`;
  if (style === "full")  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  return `${months[d.getMonth()]} ${d.getDate()}`;
}

export function getWeekNumber(d) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(((date - yearStart) / 86_400_000 + 1) / 7);
}

export function buildCalendarCells(year, month) {
  const total = getDaysInMonth(year, month);
  const first = getFirstDayOfWeek(year, month);
  const cells = [...Array(first).fill(null), ...Array.from({ length: total }, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export function getHolidayKey(month, day) {
  return `${month + 1}-${day}`;
}
