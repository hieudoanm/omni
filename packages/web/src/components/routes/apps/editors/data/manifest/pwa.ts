export interface PWAManifest {
  /* ===== Required (per spec / practice) ===== */
  name: string;
  short_name: string;
  start_url: string;
  display: 'fullscreen' | 'standalone' | 'minimal-ui' | 'browser';

  /* ===== Identity & Metadata ===== */
  id: string;
  description: string;
  categories: string[];
  lang: string; // e.g. "en", "vi"
  dir: 'ltr' | 'rtl' | 'auto';

  /* ===== Appearance ===== */
  background_color: string;
  theme_color: string;
  orientation:
    | 'any'
    | 'natural'
    | 'portrait'
    | 'portrait-primary'
    | 'portrait-secondary'
    | 'landscape'
    | 'landscape-primary'
    | 'landscape-secondary';

  /* ===== Scope & Navigation ===== */
  scope: string;
  scope_extensions: {
    type: string;
    origin: string;
  }[];

  /* ===== Icons ===== */
  icons: {
    src: string;
    sizes: string; // e.g. "192x192"
    type: string; // e.g. "image/png"
    purpose: 'any' | 'maskable' | 'monochrome' | string;
  }[];

  /* ===== Screenshots (Install UI) ===== */
  screenshots: {
    src: string;
    sizes: string;
    type: string;
    label: string;
    form_factor: 'wide' | 'narrow';
    platform:
      | 'android'
      | 'chromeos'
      | 'ios'
      | 'ipados'
      | 'kaios'
      | 'macos'
      | 'windows'
      | 'xbox'
      | 'chrome_web_store'
      | 'itunes'
      | 'microsoft-inbox'
      | 'microsoft-store'
      | 'play';
  }[];

  /* ===== Shortcuts ===== */
  shortcuts: {
    name: string;
    short_name: string;
    description: string;
    url: string;
    icons: {
      src: string;
      sizes: string;
      type: string;
      purpose: string;
    }[];
  }[];

  /* ===== Related / Native Apps ===== */
  related_applications: {
    platform: string; // e.g. "play", "itunes", "windows"
    url: string;
    id: string;
  }[];
  prefer_related_applications: boolean;

  /* ===== Advanced Capabilities (Chromium) ===== */
  file_handlers: {
    action: string;
    accept: Record<string, string[]>;
  }[];

  protocol_handlers: {
    protocol: string;
    url: string;
  }[];

  launch_handler: {
    client_mode: 'auto' | 'focus-existing' | 'navigate-existing' | 'navigate-new';
  };

  note_taking: {
    new_note_url: string;
  };

  /* ===== iarc / content rating (Chrome) ===== */
  iarc_rating_id: string;
}

export const manifest: PWAManifest = {
  background_color: '',
  categories: [],
  description: '',
  display: 'fullscreen',
  file_handlers: [],
  icons: [],
  id: '',
  launch_handler: { client_mode: 'focus-existing' },
  name: '',
  note_taking: { new_note_url: '' },
  orientation: 'landscape',
  prefer_related_applications: false,
  protocol_handlers: [],
  related_applications: [],
  scope: '',
  scope_extensions: [],
  screenshots: [],
  start_url: '',
  short_name: '',
  lang: '',
  dir: 'auto',
  theme_color: '',
  shortcuts: [],
  iarc_rating_id: '',
};
