import { averageTime, pace, PACE_LABEL, PACE_NOTE } from '@/lib/office/keynotes/rehearsal';

describe('rehearsal', () => {
  it('classifies pace from slide time', () => {
    expect(pace(20)).toBe('fast');
    expect(pace(45)).toBe('good');
    expect(pace(150)).toBe('slow');
  });

  it('labels each pace', () => {
    expect(PACE_LABEL.fast).toBe('Good pace');
    expect(PACE_LABEL.slow).toBe('Slow down');
    expect(PACE_NOTE.good).toContain('solid');
  });

  it('averages slide times', () => {
    expect(averageTime([30, 60, 90])).toBe(60);
    expect(averageTime([])).toBe(0);
  });
});
