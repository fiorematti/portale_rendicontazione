export interface CalendarDay {
  value: number | null;
}

/**
 * Generates calendar days for a given month/year.
 * Returns an array of CalendarDay objects with null for offset days.
 */
export function generateCalendarDays(year: number, month: number): (number | null)[] {
  const days: (number | null)[] = [];
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const offset = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
  for (let i = 0; i < offset; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);
  return days;
}

/**
 * Navigates month by delta (-1 or +1) and returns updated month/year.
 */
export function navigateMonth(currentMonth: number, currentYear: number, delta: number): { month: number; year: number } {
  let month = currentMonth + delta;
  let year = currentYear;
  if (month < 0) { month = 11; year--; }
  if (month > 11) { month = 0; year++; }
  return { month, year };
}

/**
 * Formats a selected day into dd/MM/yyyy string.
 */
export function formatSelectedDay(day: number, month: number, year: number): string {
  const d = day.toString().padStart(2, '0');
  const m = (month + 1).toString().padStart(2, '0');
  return `${d}/${m}/${year}`;
}

/**
 * Checks if a given day is the currently selected date.
 */
export function isDaySelected(day: number | null, selectedDate: string, currentMonth: number, currentYear: number): boolean {
  if (!day) return false;
  const dateStr = formatSelectedDay(day, currentMonth, currentYear);
  return selectedDate === dateStr;
}

export const MONTH_NAMES_IT = [
  'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
  'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre',
];
