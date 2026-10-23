export const oklchToHex = (oklch: string): string => {
  const match = oklch.match(/oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)\)/);
  if (!match) return '#000000';
  const [, L, C] = match.map(Number);
  let [, , , H] = match.map(Number);
  H = (H * Math.PI) / 180;
  const a = C * Math.cos(H);
  const b = C * Math.sin(H);
  let l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  let m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  let s_ = L - 0.0894841775 * a - 1.291485548 * b;
  l_ = Math.pow(l_, 3);
  m_ = Math.pow(m_, 3);
  s_ = Math.pow(s_, 3);
  let r = 4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_;
  let g = -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_;
  let b2 = -0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_;
  const toSRGB = (x: number) => (x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055);
  r = Math.min(255, Math.max(0, toSRGB(r) * 255));
  g = Math.min(255, Math.max(0, toSRGB(g) * 255));
  b2 = Math.min(255, Math.max(0, toSRGB(b2) * 255));
  return '#' + [r, g, b2].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
};

export const labToHex = (lab: string): string => {
  const match = lab.match(/lab\(\s*([\d.]+)\s*([\d.-]+)\s*([\d.-]+)\s*\)/i);
  if (!match) return '#000000';
  const L = parseFloat(match[1]);
  const a = parseFloat(match[2]);
  const b_ = parseFloat(match[3]);
  let y = (L + 16) / 116;
  let x = a / 500 + y;
  let z = y - b_ / 200;
  const xyzPivot = (t: number) =>
    Math.pow(t, 3) > 0.008856 ? Math.pow(t, 3) : (t - 16 / 116) / 7.787;
  x = xyzPivot(x) * 0.95047;
  y = xyzPivot(y) * 1.0;
  z = xyzPivot(z) * 1.08883;
  let r = x * 3.2406 + y * -1.5372 + z * -0.4986;
  let g = x * -0.9689 + y * 1.8758 + z * 0.0415;
  let b = x * 0.0557 + y * -0.204 + z * 1.057;
  const gamma = (u: number) => (u <= 0.0031308 ? 12.92 * u : 1.055 * Math.pow(u, 1 / 2.4) - 0.055);
  r = Math.min(1, Math.max(0, gamma(r)));
  g = Math.min(1, Math.max(0, gamma(g)));
  b = Math.min(1, Math.max(0, gamma(b)));
  const toHex = (v: number) =>
    Math.round(v * 255)
      .toString(16)
      .padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

export const inlineTailwindStyles = (root: HTMLElement) => {
  const props = [
    'width',
    'height',
    'minWidth',
    'minHeight',
    'padding',
    'paddingTop',
    'paddingBottom',
    'paddingLeft',
    'paddingRight',
    'margin',
    'marginTop',
    'marginBottom',
    'marginLeft',
    'marginRight',
    'gap',
    'fontSize',
    'fontWeight',
    'lineHeight',
    'letterSpacing',
    'color',
    'backgroundColor',
    'borderColor',
    'borderWidth',
    'borderRadius',
    'backgroundImage',
  ];
  root.querySelectorAll<HTMLElement>('*').forEach((el) => {
    const computed = getComputedStyle(el);
    props.forEach((prop) => {
      let value = computed.getPropertyValue(prop);
      if (!value) return;
      if (value.includes('oklch(')) value = oklchToHex(value);
      if (value.includes('lab(')) value = labToHex(value);
      el.style.setProperty(prop.replace(/([A-Z])/g, '-$1').toLowerCase(), value);
    });
  });
};

export const applyExportSafeColors = (root: HTMLElement) => {
  const modified: Array<{ element: HTMLElement; style: string }> = [];
  const htmlElements = Array.from(root.querySelectorAll<HTMLElement>('*')).concat(root);
  htmlElements.forEach((el) => {
    const style = getComputedStyle(el);
    for (let i = 0; i < style.length; i++) {
      const prop = style[i];
      const value = style.getPropertyValue(prop);
      if (!value) continue;
      if (value.includes('oklch(')) {
        modified.push({ element: el, style: el.getAttribute('style') || '' });
        el.style.setProperty(prop, oklchToHex(value));
      } else if (value.includes('lab(')) {
        modified.push({ element: el, style: el.getAttribute('style') || '' });
        el.style.setProperty(prop, labToHex(value));
      } else if (value.includes('color(')) {
        modified.push({ element: el, style: el.getAttribute('style') || '' });
        el.style.setProperty(prop, '#000000');
      }
    }
  });
  return () => {
    modified.forEach(({ element, style }) => {
      if (style) element.setAttribute('style', style);
      else element.removeAttribute('style');
    });
  };
};
