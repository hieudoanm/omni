import { captureScreen } from '@/lib/office/keynotes/capture';

describe('captureScreen', () => {
  it('returns null when getDisplayMedia is unavailable', async () => {
    Object.defineProperty(navigator, 'mediaDevices', {
      value: undefined,
      configurable: true,
    });
    await expect(captureScreen()).resolves.toBeNull();
  });

  it('returns null when getDisplayMedia throws', async () => {
    Object.defineProperty(navigator, 'mediaDevices', {
      value: {
        getDisplayMedia: jest.fn().mockRejectedValue(new Error('denied')),
      },
      configurable: true,
    });
    await expect(captureScreen()).resolves.toBeNull();
  });

  it('captures a frame and returns a data URL', async () => {
    const stop = jest.fn();
    const stream = { getTracks: () => [{ stop }] };
    Object.defineProperty(navigator, 'mediaDevices', {
      value: { getDisplayMedia: jest.fn().mockResolvedValue(stream) },
      configurable: true,
    });

    const video = document.createElement('video');
    Object.defineProperty(video, 'srcObject', {
      set: () => {
        queueMicrotask(() => video.onloadedmetadata?.(new Event('loaded')));
      },
    });
    video.play = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(video, 'videoWidth', { value: 640 });
    Object.defineProperty(video, 'videoHeight', { value: 360 });

    const realCreate = document.createElement.bind(document);
    const spy = jest
      .spyOn(document, 'createElement')
      .mockImplementation((tag: string, options?: ElementCreationOptions) => {
        if (tag === 'video') return video as unknown as HTMLVideoElement;
        return realCreate(tag, options);
      });

    const dataUrl = await captureScreen();
    expect(dataUrl).toMatch(/^data:/);
    expect(stop).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('returns null when the video fails to load', async () => {
    Object.defineProperty(navigator, 'mediaDevices', {
      value: {
        getDisplayMedia: jest.fn().mockResolvedValue({ getTracks: () => [] }),
      },
      configurable: true,
    });
    const video = document.createElement('video');
    Object.defineProperty(video, 'srcObject', {
      set: () => {
        queueMicrotask(() => video.onerror?.(new Event('error')));
      },
    });
    const realCreate = document.createElement.bind(document);
    const spy = jest
      .spyOn(document, 'createElement')
      .mockImplementation((tag: string, options?: ElementCreationOptions) => {
        if (tag === 'video') return video as unknown as HTMLVideoElement;
        return realCreate(tag, options);
      });

    await expect(captureScreen()).resolves.toBeNull();
    spy.mockRestore();
  });
});
