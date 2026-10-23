import { TIME_BLOCKS } from '@/data/office/calendar/timeBlocks';

describe('timeBlocks', () => {
  it('has 8 time blocks', () => {
    expect(TIME_BLOCKS).toHaveLength(8);
  });

  it('covers full 24 hours', () => {
    expect(TIME_BLOCKS[0].start).toBe(0);
    expect(TIME_BLOCKS[TIME_BLOCKS.length - 1].end).toBe(24);
  });

  it('has contiguous blocks', () => {
    for (let i = 1; i < TIME_BLOCKS.length; i++) {
      expect(TIME_BLOCKS[i].start).toBe(TIME_BLOCKS[i - 1].end);
    }
  });

  it('each block has label, start, end', () => {
    for (const block of TIME_BLOCKS) {
      expect(typeof block.label).toBe('string');
      expect(typeof block.start).toBe('number');
      expect(typeof block.end).toBe('number');
      expect(block.end).toBeGreaterThan(block.start);
    }
  });
});
