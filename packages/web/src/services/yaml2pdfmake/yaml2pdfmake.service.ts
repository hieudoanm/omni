import { parse } from 'yaml';
import { Education, Experience, PdfContent, Project, ResumeData } from '.';

/* =====================
   HELPERS
===================== */

export type SafeArray<T> = T[] | undefined;
export const safe = <T>(arr: SafeArray<T>): T[] => arr ?? [];

const hasItems = <T>(arr: SafeArray<T>): arr is T[] => Array.isArray(arr) && arr.length > 0;

const formatDateRange = (start?: string, end?: string, fallback = 'Present'): string | null => {
  if (!start && !end) return null;
  if (start && end) return `${start} – ${end}`;
  return start ? `${start} – ${fallback}` : (end ?? null);
};

/* =====================
   THEMES
===================== */

type ThemeName = 'classic' | 'modern' | 'contrast';

const THEMES: Record<
  ThemeName,
  {
    colors: {
      text: string;
      muted: string;
      subtle: string;
      accent: string;
      divider: string;
    };
  }
> = {
  classic: {
    colors: {
      text: '#000000',
      muted: '#333333',
      subtle: '#555555',
      accent: '#000000',
      divider: '#000000',
    },
  },
  modern: {
    colors: {
      text: '#111827',
      muted: '#6b7280',
      subtle: '#9ca3af',
      accent: '#2563eb',
      divider: '#e5e7eb',
    },
  },
  contrast: {
    colors: {
      text: '#000000',
      muted: '#1f2937',
      subtle: '#374151',
      accent: '#111827',
      divider: '#111827',
    },
  },
};

const createStyles = (theme: ThemeName) => {
  const C = THEMES[theme].colors;

  return {
    name: { fontSize: 26, bold: true, color: C.text, margin: [0, 0, 0, 4] },
    tagline: { fontSize: 12, color: C.muted, margin: [0, 0, 0, 10] },
    metaLine: { fontSize: 10, color: C.subtle, margin: [0, 0, 0, 6] },
    sectionTitle: {
      fontSize: 13,
      bold: true,
      color: C.text,
      margin: [0, 18, 0, 6],
    },
    itemTitle: { fontSize: 11, bold: true, color: C.text },
    itemMeta: {
      fontSize: 9.5,
      color: C.muted,
      margin: [0, 1, 0, 3],
    },
    body: {
      fontSize: 10,
      color: C.text,
      lineHeight: 1.4,
      margin: [0, 1, 0, 2],
    },
    bullet: { fontSize: 10, color: C.text, lineHeight: 1.3 },
    link: {
      fontSize: 9,
      color: C.accent,
      decoration: 'underline',
    },
  };
};

/* =====================
   ATS KEYWORD HIGHLIGHT
===================== */

const highlightATS = (text: string, keywords: string[]): PdfContent => {
  if (!hasItems(keywords)) return { text };

  const parts = text.split(new RegExp(`(${keywords.join('|')})`, 'gi'));

  return {
    text: parts.map((p) =>
      keywords.some((k) => k.toLowerCase() === p.toLowerCase()) ? { text: p, bold: true } : p,
    ),
  };
};

/* =====================
   SECTION BUILDERS
===================== */

const section = (
  title: string,
  items: SafeArray<PdfContent>,
  dividerColor: string,
): PdfContent[] =>
  hasItems(items)
    ? [
        {
          stack: [
            { text: title.toUpperCase(), style: 'sectionTitle' },
            {
              canvas: [
                {
                  type: 'line',
                  x1: 0,
                  y1: 0,
                  x2: 515,
                  y2: 0,
                  lineWidth: 0.5,
                  lineColor: dividerColor,
                },
              ],
              margin: [0, 0, 0, 8],
            },
            ...items,
          ],
        },
      ]
    : [];

const bulletList = (items: SafeArray<string>, keywords: string[]): PdfContent | null =>
  hasItems(items)
    ? {
        ul: items.map((t) => highlightATS(t, keywords)),
        margin: [0, 2, 0, 0],
      }
    : null;

/* =====================
   ITEM BUILDERS
===================== */

const experienceItem = (e: Experience, kw: string[]): PdfContent => ({
  margin: [0, 0, 0, 10],
  stack: [
    highlightATS(`${e.position} — ${e.company}`, kw),
    ...(formatDateRange(e.start_date, e.end_date)
      ? [
          {
            text: formatDateRange(e.start_date, e.end_date)!,
            style: 'itemMeta',
          },
        ]
      : []),
    ...(bulletList(e.highlights, kw) ? [bulletList(e.highlights, kw)!] : []),
  ],
});

const educationItem = (e: Education, kw: string[]): PdfContent => ({
  margin: [0, 0, 0, 8],
  stack: [
    highlightATS(e.degree, kw),
    { text: e.institution, style: 'body' },
    ...(formatDateRange(e.start_date, e.end_date)
      ? [
          {
            text: formatDateRange(e.start_date, e.end_date)!,
            style: 'itemMeta',
          },
        ]
      : []),
  ],
});

const projectItem = (p: Project, kw: string[]): PdfContent => ({
  margin: [0, 0, 0, 8],
  stack: [
    highlightATS(p.name, kw),
    highlightATS(p.description, kw),
    ...(p.link ? [{ text: p.link, link: p.link, style: 'link' }] : []),
  ],
});

/* =====================
   MAIN
===================== */

export const yaml2pdfMake = (yamlText: string) => {
  const yamlObject: { resume: ResumeData } = parse(yamlText);
  const { resume: data } = yamlObject;

  const theme: ThemeName = data.theme ?? 'modern';
  const atsKeywords: string[] = data.ats?.keywords ?? [];

  const styles = createStyles(theme);
  const dividerColor = THEMES[theme].colors.divider;

  const header: PdfContent = {
    stack: [
      { text: data.info.name, style: 'name' },
      { text: data.info.title, style: 'tagline' },
      {
        text: [data.info.mobile, data.info.email, data.info.website, data.info.address]
          .filter(Boolean)
          .join(' · '),
        style: 'metaLine',
      },
    ],
  };

  const content: PdfContent[] = [
    header,

    ...(data.personal_statement ? [highlightATS(data.personal_statement, atsKeywords)] : []),

    ...section(
      'Experience',
      safe(data.sections.experiences).map((e) => experienceItem(e, atsKeywords)),
      dividerColor,
    ),

    ...section(
      'Education',
      safe(data.sections.education).map((e) => educationItem(e, atsKeywords)),
      dividerColor,
    ),

    ...section(
      'Projects',
      safe(data.sections.projects).map((p) => projectItem(p, atsKeywords)),
      dividerColor,
    ),
  ];

  return {
    pageSize: 'A4' as const,
    pageMargins: [40, 42, 40, 42] as const,
    styles,
    content,
  };
};
