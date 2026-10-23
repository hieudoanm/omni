import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';
import { TextDecoder, TextEncoder } from 'util';

global.TextEncoder = TextEncoder as any;
global.TextDecoder = TextDecoder as any;

if (typeof Element !== 'undefined') {
  Element.prototype.scrollIntoView = () => {};
  Element.prototype.scrollTo = () => {};
  Element.prototype.setPointerCapture = () => {};
  Element.prototype.releasePointerCapture = () => {};
  Element.prototype.animate = () =>
    ({
      play: () => {},
      cancel: () => {},
      pause: () => {},
      finished: Promise.resolve(),
    }) as unknown as Animation;
}

global.requestAnimationFrame = (cb: FrameRequestCallback): number =>
  setTimeout(() => cb(Date.now()), 0) as unknown as number;
global.cancelAnimationFrame = (id: number): void => clearTimeout(id as unknown as NodeJS.Timeout);

class MockObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

global.ResizeObserver = MockObserver as unknown as typeof ResizeObserver;
global.IntersectionObserver = Object.assign(new MockObserver(), {
  root: null,
  rootMargin: '',
  thresholds: [],
}) as unknown as typeof IntersectionObserver;

const context2d = (): CanvasRenderingContext2D => {
  const ctx: Record<string, unknown> = {};
  const methods = [
    'scale',
    'save',
    'restore',
    'translate',
    'rotate',
    'beginPath',
    'moveTo',
    'lineTo',
    'arc',
    'rect',
    'fill',
    'stroke',
    'fillRect',
    'strokeRect',
    'clearRect',
    'drawImage',
    'fillText',
    'strokeText',
    'setLineDash',
    'clip',
    'closePath',
    'quadraticCurveTo',
    'bezierCurveTo',
    'ellipse',
    'setTransform',
    'putImageData',
  ];
  for (const method of methods) ctx[method] = jest.fn();
  ctx.measureText = jest.fn(() => ({ width: 10 }));
  ctx.createLinearGradient = jest.fn(() => ({ addColorStop: jest.fn() }));
  ctx.createRadialGradient = jest.fn(() => ({ addColorStop: jest.fn() }));
  ctx.getImageData = jest.fn(() => ({
    data: new Uint8ClampedArray(4),
    width: 1,
    height: 1,
  }));
  return ctx as unknown as CanvasRenderingContext2D;
};

const installDomMocks = (): void => {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: jest.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      addListener: jest.fn(),
      removeListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });

  Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
    configurable: true,
    writable: true,
    value: jest.fn(() => context2d()),
  });
  Object.defineProperty(HTMLCanvasElement.prototype, 'toDataURL', {
    configurable: true,
    writable: true,
    value: jest.fn(() => 'data:image/png;base64,iVBORw0KGgo='),
  });
  Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
    configurable: true,
    writable: true,
    value: jest.fn((cb: BlobCallback) => cb(new Blob(['png']))),
  });

  Object.defineProperty(window, 'alert', {
    configurable: true,
    writable: true,
    value: jest.fn(),
  });
  Object.defineProperty(window, 'confirm', {
    configurable: true,
    writable: true,
    value: jest.fn(() => true),
  });
  Object.defineProperty(window, 'prompt', {
    configurable: true,
    writable: true,
    value: jest.fn(() => null),
  });

  Object.defineProperty(URL, 'createObjectURL', {
    configurable: true,
    writable: true,
    value: jest.fn(() => 'blob:test'),
  });
  Object.defineProperty(URL, 'revokeObjectURL', {
    configurable: true,
    writable: true,
    value: jest.fn(),
  });

  Object.defineProperty(HTMLElement.prototype, 'requestFullscreen', {
    configurable: true,
    writable: true,
    value: jest.fn(),
  });
  Object.defineProperty(document, 'exitFullscreen', {
    configurable: true,
    writable: true,
    value: jest.fn(),
  });
};

if (typeof window !== 'undefined') {
  installDomMocks();
}

process.env.NEXT_PUBLIC_AUTOSAVE_DEBOUNCE_MS = '20';

configure({ asyncUtilTimeout: 5000 });

const mockRouterPush = jest.fn();
const mockRouterBack = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockRouterPush, back: mockRouterBack }),
  useParams: () => ({ id: 'deck-test' }),
  usePathname: () => '/keynotes/',
  useSearchParams: () => new URLSearchParams(),
}));

(globalThis as unknown as { __resetRouterMock: () => void }).__resetRouterMock = () => {
  mockRouterPush.mockClear();
  mockRouterBack.mockClear();
};
