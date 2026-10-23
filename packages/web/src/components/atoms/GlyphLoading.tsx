const Dot = ({ delay }: { delay: number }) => (
  <span
    className='bg-base-content inline-block h-2 w-2 rounded-full'
    style={{
      animation: 'glyph-pulse 1.4s ease-in-out infinite',
      animationDelay: `${delay}s`,
    }}
  />
);

export const GlyphLoading = () => (
  <div className='flex items-center gap-2' role='status' aria-label='Loading'>
    <Dot delay={0} />
    <Dot delay={0.2} />
    <Dot delay={0.4} />
  </div>
);

GlyphLoading.displayName = 'GlyphLoading';
