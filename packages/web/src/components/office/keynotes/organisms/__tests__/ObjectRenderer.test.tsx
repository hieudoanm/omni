import { render, screen } from '@testing-library/react';
import { ObjectRenderer } from '@/components/office/keynotes/organisms/ObjectRenderer';
import { newShapeObject } from '@/lib/office/keynotes/deckFactory';
import type { SlideObject } from '@/types/keynotes/deck';

describe('ObjectRenderer hyperlinks', () => {
  const renderLinked = (link: SlideObject['link'], onSlideLink = jest.fn()) => {
    const obj = { ...newShapeObject(), link } as SlideObject;
    const { container } = render(
      <ObjectRenderer obj={obj} interactive onSlideLink={onSlideLink} />,
    );
    return { container, onSlideLink };
  };

  it('wraps a url link in an anchor with target blank', () => {
    renderLinked({ type: 'url', url: 'https://example.com' });
    const a = screen.getByRole('link');
    expect(a).toHaveAttribute('href', 'https://example.com');
    expect(a).toHaveAttribute('target', '_blank');
  });

  it('wraps an email link in a mailto anchor', () => {
    renderLinked({ type: 'email', email: 'hi@example.com' });
    expect(screen.getByRole('link')).toHaveAttribute('href', 'mailto:hi@example.com');
  });

  it('renders a slide link that calls onSlideLink on click', () => {
    const onSlideLink = jest.fn();
    const { container } = renderLinked({ type: 'slide', slideId: 'abc' }, onSlideLink);
    const a = screen.getByRole('link');
    a.click();
    expect(onSlideLink).toHaveBeenCalledWith('abc');
    expect(container.querySelector('a')).not.toHaveAttribute('target');
  });

  it('renders a plain div when no link is set even in interactive mode', () => {
    const { container } = renderLinked(undefined);
    expect(container.querySelector('a')).toBeNull();
    expect(container.querySelector('div')).not.toBeNull();
  });
});
