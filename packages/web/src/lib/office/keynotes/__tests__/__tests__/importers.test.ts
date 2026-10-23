import {
  parseImportText,
  parsePptxMock,
  parseGoogleSlidesDeck,
  fetchGoogleSlidesMock,
} from '@/lib/office/keynotes/importers';

describe('importers', () => {
  describe('parsePptxMock', () => {
    it('throws for non-PPTX mock content', () => {
      expect(() => parsePptxMock('not json')).toThrow('Not a valid PPTX mock file');
    });

    it('throws when slides array is missing', () => {
      expect(() => parsePptxMock(JSON.stringify({ format: 'ppt-mock', title: 'X' }))).toThrow(
        'Not a valid PPTX mock file',
      );
    });

    it('builds a deck with text, content, image and shape objects', () => {
      const deck = parsePptxMock(
        JSON.stringify({
          format: 'ppt-mock',
          title: 'Quarterly review',
          slides: [
            {
              title: 'Q3 Review',
              subtitle: 'Growth +32%',
              imageUrl: 'https://example.com/chart.png',
            },
            {
              title: 'Highlights',
              content: ['Revenue up', 'New regions'],
              shape: 'diamond',
            },
          ],
        }),
      );
      expect(deck.title).toBe('Quarterly review');
      expect(deck.slides).toHaveLength(2);
      expect(deck.slides[0].name).toContain('Q3 Review');
      expect(deck.slides[0].objects.map((o) => o.kind)).toEqual(
        expect.arrayContaining(['text', 'image']),
      );
      expect(
        deck.slides[1].objects.some((o) => o.kind === 'text' && o.text.includes('Revenue up')),
      ).toBe(true);
      expect(deck.slides[1].objects.find((o) => o.kind === 'shape')?.kind).toBe('shape');
    });
  });

  describe('parseImportText', () => {
    it('parses native deck JSON', () => {
      const deck = parseImportText(
        JSON.stringify({
          title: 'Native',
          width: 1800,
          height: 1013,
          slides: [],
        }),
      );
      expect(deck.title).toBe('Native');
    });

    it('falls back to the PPTX mock format', () => {
      const deck = parseImportText(
        JSON.stringify({ title: 'Fallen back', slides: [{ title: 'A' }] }),
      );
      expect(deck.title).toBe('Fallen back');
      expect(deck.slides).toHaveLength(1);
    });
  });

  describe('parseGoogleSlidesDeck', () => {
    it('builds a three-slide deck from a slide id', () => {
      const deck = parseGoogleSlidesDeck('abc123');
      expect(deck.title).toBe('Imported from Google Slides');
      expect(deck.slides).toHaveLength(3);
      expect(deck.description).toContain('mock');
    });
  });

  describe('fetchGoogleSlidesMock', () => {
    it('returns a deck for a valid Google Slides URL', async () => {
      const deck = await fetchGoogleSlidesMock(
        'https://docs.google.com/presentation/d/xyz123/edit',
      );
      expect(deck.slides.length).toBeGreaterThan(0);
    });

    it('rejects non-Google URLs', async () => {
      await expect(fetchGoogleSlidesMock('https://example.com/presentation/x')).rejects.toThrow(
        'Not a Google Slides URL',
      );
    });
  });
});
