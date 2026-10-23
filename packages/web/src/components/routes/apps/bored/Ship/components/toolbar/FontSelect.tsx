import type { FC } from 'react';

import {
  DM_Sans,
  Fira_Code,
  IBM_Plex_Mono,
  Inconsolata,
  Inter,
  JetBrains_Mono,
  Lora,
  Merriweather,
  Montserrat,
  Nunito,
  Open_Sans,
  Oswald,
  Playfair_Display,
  Poppins,
  Raleway,
  Roboto,
  Roboto_Mono,
  Source_Code_Pro,
  Space_Mono,
  Ubuntu_Mono,
} from 'next/font/google';

const dmSans = DM_Sans({ subsets: ['latin'] });
const firaCode = Fira_Code({ subsets: ['latin'] });
const ibmPlexMono = IBM_Plex_Mono({ subsets: ['latin'], weight: '400' });
const inconsolata = Inconsolata({ subsets: ['latin'] });
const inter = Inter({ subsets: ['latin'] });
const jetBrainsMono = JetBrains_Mono({ subsets: ['latin'] });
const lora = Lora({ subsets: ['latin'] });
const merriweather = Merriweather({ subsets: ['latin'], weight: '400' });
const montserrat = Montserrat({ subsets: ['latin'] });
const nunito = Nunito({ subsets: ['latin'] });
const openSans = Open_Sans({ subsets: ['latin'] });
const oswald = Oswald({ subsets: ['latin'] });
const playfairDisplay = Playfair_Display({ subsets: ['latin'] });
const poppins = Poppins({ subsets: ['latin'], weight: '400' });
const raleway = Raleway({ subsets: ['latin'] });
const roboto = Roboto({ subsets: ['latin'] });
const robotoMono = Roboto_Mono({ subsets: ['latin'] });
const sourceCodePro = Source_Code_Pro({ subsets: ['latin'] });
const spaceMono = Space_Mono({ subsets: ['latin'], weight: '400' });
const ubuntuMono = Ubuntu_Mono({ subsets: ['latin'], weight: '400' });

export const FONTS = {
  'DM Sans': { className: dmSans.className },
  'Fira Code': { className: firaCode.className },
  'IBM Plex Mono': { className: ibmPlexMono.className },
  Inconsolata: { className: inconsolata.className },
  Inter: { className: inter.className },
  'JetBrains Mono': { className: jetBrainsMono.className },
  Lora: { className: lora.className },
  Merriweather: { className: merriweather.className },
  Montserrat: { className: montserrat.className },
  Nunito: { className: nunito.className },
  'Open Sans': { className: openSans.className },
  Oswald: { className: oswald.className },
  'Playfair Display': { className: playfairDisplay.className },
  Poppins: { className: poppins.className },
  Raleway: { className: raleway.className },
  Roboto: { className: roboto.className },
  'Roboto Mono': { className: robotoMono.className },
  'Source Code Pro': { className: sourceCodePro.className },
  'Space Mono': { className: spaceMono.className },
  'Ubuntu Mono': { className: ubuntuMono.className },
} as const;

export type FontName = keyof typeof FONTS;

export const DEFAULT_FONT: FontName = 'Roboto Mono';

const FONT_GROUPS = {
  Display: ['Oswald'] as const,
  Mono: [
    'Fira Code',
    'IBM Plex Mono',
    'Inconsolata',
    'JetBrains Mono',
    'Roboto Mono',
    'Source Code Pro',
    'Space Mono',
    'Ubuntu Mono',
  ] as const,
  Serif: ['Lora', 'Merriweather', 'Playfair Display'] as const,
  'Sans-serif': [
    'DM Sans',
    'Inter',
    'Montserrat',
    'Nunito',
    'Open Sans',
    'Poppins',
    'Raleway',
    'Roboto',
  ] as const,
} as const;

export const FontSelect: FC<{
  value: FontName;
  onChange: (v: FontName) => void;
}> = ({ value, onChange }) => (
  <label className='flex flex-col gap-1'>
    <span className='text-neutral text-center text-xs font-semibold tracking-widest uppercase'>
      Font
    </span>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as FontName)}
      className='rounded-box border-base-300 bg-base-200 text-neutral hover:border-neutral hover:text-base-content cursor-pointer border px-3 py-1.5 text-xs font-medium tracking-wider transition-all duration-200'>
      {Object.entries(FONT_GROUPS).map(([group, fonts]) => (
        <optgroup key={group} label={group}>
          {fonts.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  </label>
);
