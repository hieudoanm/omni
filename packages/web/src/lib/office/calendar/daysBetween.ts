export interface DaysCountResult {
  totalDays: number;
  years: number;
  months: number;
  days: number;
}

const daysInMonth = (year: number, month: number): number => new Date(year, month + 1, 0).getDate();

export const daysBetween = (from: Date, to: Date): DaysCountResult => {
  if (from > to) {
    [from, to] = [to, from];
  }

  const totalDays = Math.round((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));

  let years = to.getFullYear() - from.getFullYear();
  let months = to.getMonth() - from.getMonth();
  let days = to.getDate() - from.getDate();

  if (days < 0) {
    months--;
    const prevMonth = (to.getMonth() - 1 + 12) % 12;
    const prevMonthYear = months < 0 ? to.getFullYear() - 1 : to.getFullYear();
    days += daysInMonth(prevMonthYear, prevMonth);
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  return { totalDays, years, months, days };
};
