import {
  isLeapYear,
  daysOfMonths,
  months,
  monthsShort,
  DAY_SHORT,
  HOURS,
  START_YEAR,
  END_YEAR,
  years,
  getDaysInMonth,
  getFirstDayOfMonth,
  isToday,
  formatHour,
  View,
} from '../constants';

describe('constants', () => {
  describe('isLeapYear', () => {
    it('returns true for leap years', () => {
      expect(isLeapYear(2024)).toBe(true);
      expect(isLeapYear(2000)).toBe(true);
    });

    it('returns false for non-leap years', () => {
      expect(isLeapYear(2023)).toBe(false);
      expect(isLeapYear(1900)).toBe(false);
    });
  });

  describe('daysOfMonths', () => {
    it('has 12 months', () => {
      expect(daysOfMonths).toHaveLength(12);
    });

    it('has correct days for January', () => {
      expect(daysOfMonths[0]).toBe(31);
    });

    it('has correct days for February', () => {
      expect(daysOfMonths[1]).toBe(28);
    });
  });

  describe('months', () => {
    it('has 12 months', () => {
      expect(months).toHaveLength(12);
    });

    it('starts with January', () => {
      expect(months[0]).toBe('January');
    });

    it('ends with December', () => {
      expect(months[11]).toBe('December');
    });
  });

  describe('monthsShort', () => {
    it('has 12 months', () => {
      expect(monthsShort).toHaveLength(12);
    });

    it('starts with Jan', () => {
      expect(monthsShort[0]).toBe('Jan');
    });
  });

  describe('DAY_SHORT', () => {
    it('has 7 days', () => {
      expect(DAY_SHORT).toHaveLength(7);
    });
  });

  describe('HOURS', () => {
    it('has 24 hours', () => {
      expect(HOURS).toHaveLength(24);
    });

    it('starts at 0', () => {
      expect(HOURS[0]).toBe(0);
    });

    it('ends at 23', () => {
      expect(HOURS[23]).toBe(23);
    });
  });

  describe('years', () => {
    it('spans from START_YEAR to END_YEAR', () => {
      expect(years[0]).toBe(START_YEAR);
      expect(years[years.length - 1]).toBe(END_YEAR);
    });

    it('has correct length', () => {
      expect(years).toHaveLength(END_YEAR - START_YEAR + 1);
    });
  });

  describe('View', () => {
    it('has all view types', () => {
      expect(View.THREE_DAY).toBe('3-day');
      expect(View.DAY).toBe('day');
      expect(View.WEEK).toBe('week');
      expect(View.MONTH).toBe('month');
      expect(View.QUARTERLY).toBe('quarterly');
      expect(View.HALFLY).toBe('halfly');
      expect(View.YEARLY).toBe('yearly');
    });
  });

  describe('getDaysInMonth', () => {
    it('returns 31 for January', () => {
      expect(getDaysInMonth(2024, 0)).toBe(31);
    });

    it('returns 29 for February in leap year', () => {
      expect(getDaysInMonth(2024, 1)).toBe(29);
    });

    it('returns 28 for February in non-leap year', () => {
      expect(getDaysInMonth(2023, 1)).toBe(28);
    });
  });

  describe('getFirstDayOfMonth', () => {
    it('returns correct first day for January 2024 (Monday)', () => {
      expect(getFirstDayOfMonth(2024, 0)).toBe(1);
    });

    it('returns correct first day for February 2024 (Thursday)', () => {
      expect(getFirstDayOfMonth(2024, 1)).toBe(4);
    });
  });

  describe('isToday', () => {
    it('returns true for today', () => {
      const t = new Date();
      expect(isToday(t.getFullYear(), t.getMonth(), t.getDate())).toBe(true);
    });

    it('returns false for a different date', () => {
      expect(isToday(2000, 0, 1)).toBe(false);
    });
  });

  describe('formatHour', () => {
    it('formats midnight as 12 AM', () => {
      expect(formatHour(0)).toBe('12 AM');
    });

    it('formats noon as 12 PM', () => {
      expect(formatHour(12)).toBe('12 PM');
    });

    it('formats morning hours', () => {
      expect(formatHour(9)).toBe('9 AM');
    });

    it('formats afternoon hours', () => {
      expect(formatHour(15)).toBe('3 PM');
    });
  });
});
