export interface ExtensionManifestV3 {
  /* ===== Required ===== */
  manifest_version: 3;
  name: string;
  version: string;

  /* ===== Optional Metadata ===== */
  description: string;
  short_name: string;
  default_locale: string;
  minimum_chrome_version: string;
  icons: {
    [size: string]: string; // "16": "icon16.png"
  };

  /* ===== Action (Toolbar Button) ===== */
  action: {
    default_title: string;
    default_popup: string;
    default_icon: {
      [size: string]: string;
    };
  };

  /* ===== Background (Service Worker) ===== */
  background: {
    service_worker: string;
    type: 'module'; // strongly recommended
  };

  /* ===== Permissions ===== */
  permissions: (
    | 'activeTab'
    | 'alarms'
    | 'bookmarks'
    | 'browsingData'
    | 'clipboardRead'
    | 'clipboardWrite'
    | 'contentSettings'
    | 'contextMenus'
    | 'cookies'
    | 'debugger'
    | 'declarativeNetRequest'
    | 'declarativeNetRequestWithHostAccess'
    | 'downloads'
    | 'downloads.open'
    | 'history'
    | 'identity'
    | 'idle'
    | 'management'
    | 'nativeMessaging'
    | 'notifications'
    | 'offscreen'
    | 'pageCapture'
    | 'power'
    | 'printerProvider'
    | 'privacy'
    | 'scripting'
    | 'search'
    | 'sessions'
    | 'sidePanel'
    | 'storage'
    | 'system.cpu'
    | 'system.display'
    | 'system.memory'
    | 'system.storage'
    | 'tabGroups'
    | 'tabs'
    | 'topSites'
    | 'tts'
    | 'ttsEngine'
    | 'unlimitedStorage'
    | 'webNavigation'
    | 'webRequest'
    | 'webRequestBlocking'
  )[];

  /* ===== Host Permissions ===== */
  host_permissions: string[];

  /* ===== Content Scripts ===== */
  content_scripts: {
    matches: string[];
    exclude_matches: string[];
    css: string[];
    js: string[];
    run_at: 'document_start' | 'document_end' | 'document_idle';
    all_frames: boolean;
    match_about_blank: boolean;
    match_origin_as_fallback: boolean;
    world: 'ISOLATED' | 'MAIN';
  }[];

  /* ===== Web Accessible Resources ===== */
  web_accessible_resources: {
    resources: string[];
    matches: string[];
    extension_ids: string[];
    use_dynamic_url: boolean;
  }[];

  /* ===== Commands (Keyboard Shortcuts) ===== */
  commands: {
    [command: string]: {
      suggested_key: {
        default: string;
        mac: string;
        windows: string;
        chromeos: string;
        linux: string;
      };
      description: string;
    };
  };

  /* ===== Options Page ===== */
  options_ui: {
    page: string;
    open_in_tab: boolean;
  };

  /* ===== DevTools ===== */
  devtools_page: string;

  /* ===== Chrome URL Overrides ===== */
  chrome_url_overrides: {
    newtab: string;
    bookmarks: string;
    history: string;
  };

  /* ===== Omnibox ===== */
  omnibox: {
    keyword: string;
  };

  /* ===== Side Panel ===== */
  side_panel: {
    default_path: string;
  };

  /* ===== Declarative Net Request ===== */
  declarative_net_request: {
    rule_resources: {
      id: string;
      enabled: boolean;
      path: string;
    }[];
  };

  /* ===== Content Security Policy ===== */
  content_security_policy: {
    extension_pages: string;
    sandbox: string;
  };

  /* ===== Incognito Mode ===== */
  incognito: 'spanning' | 'split' | 'not_allowed';

  /* ===== Export ===== */
  export: {
    allowlist: string[];
  };

  /* ===== Update & Homepage ===== */
  update_url: string;
  homepage_url: string;
}

export const manifest: ExtensionManifestV3 = {
  manifest_version: 3,
  name: '',
  version: '1.0.0',
  background: {
    service_worker: 'background.ts',
    type: 'module',
  },
  action: {
    default_popup: 'popup.html',
    default_title: '',
    default_icon: {},
  },
  permissions: ['storage', 'activeTab'],
  description: '',
  short_name: '',
  default_locale: '',
  minimum_chrome_version: '',
  icons: {},
  host_permissions: [],
  content_scripts: [],
  web_accessible_resources: [],
  commands: {},
  options_ui: {
    page: '',
    open_in_tab: false,
  },
  devtools_page: '',
  chrome_url_overrides: {
    newtab: '',
    bookmarks: '',
    history: '',
  },
  omnibox: {
    keyword: '',
  },
  side_panel: {
    default_path: '',
  },
  declarative_net_request: {
    rule_resources: [],
  },
  content_security_policy: {
    extension_pages: '',
    sandbox: '',
  },
  incognito: 'spanning',
  export: {
    allowlist: [],
  },
  update_url: '',
  homepage_url: '',
};
