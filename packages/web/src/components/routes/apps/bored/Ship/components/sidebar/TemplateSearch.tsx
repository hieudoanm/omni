import type { FC } from 'react';

export const CATEGORY_LABELS: Record<string, string> = {
  // Data & Visualization
  analytics: 'Analytics (6)',
  charts: 'Charts (6)',
  compare: 'Compare (6)',
  data: 'Data (6)',
  'data-science': 'Data Science (6)',
  dev: 'Dev (6)',
  // Content & Design
  list: 'Lists (6)',
  profile: 'Profile (6)',
  text: 'Text (6)',
  typography: 'Typography (6)',
  news: 'News (6)',
  media: 'Media (6)',
  // Business & Health
  ecommerce: 'E-Commerce (6)',
  finance: 'Finance (6)',
  food: 'Food (6)',
  health: 'Health (6)',
  marketing: 'Marketing (6)',
  inspirational: 'Inspirational (6)',
  // Social & Learning
  education: 'Education (6)',
  football: 'Football (6)',
  hierarchy: 'Hierarchy (6)',
  interactive: 'Interactive (6)',
  research: 'Research (6)',
  social: 'Social (6)',
  // Lifestyle & Tech
  countdown: 'Countdown (6)',
  device: 'Device (6)',
  sports: 'Sports (6)',
  travel: 'Travel (6)',
  weather: 'Weather (6)',
  photography: 'Photography (6)',
  // Creative Expression
  art: 'Art (6)',
  career: 'Career (6)',
  gaming: 'Gaming (6)',
  music: 'Music (6)',
  quotes: 'Quotes (6)',
  writing: 'Writing (6)',
};

export const CATEGORY_GROUPS: Array<{
  label: string;
  categories: string[];
}> = [
  {
    label: 'Data & Visualization (36)',
    categories: ['analytics', 'charts', 'compare', 'data', 'data-science', 'dev'],
  },
  {
    label: 'Content & Design (36)',
    categories: ['list', 'profile', 'text', 'typography', 'news', 'media'],
  },
  {
    label: 'Business & Health (36)',
    categories: ['ecommerce', 'finance', 'food', 'health', 'marketing', 'inspirational'],
  },
  {
    label: 'Social & Learning (36)',
    categories: ['education', 'football', 'hierarchy', 'interactive', 'research', 'social'],
  },
  {
    label: 'Lifestyle & Tech (36)',
    categories: ['countdown', 'device', 'sports', 'travel', 'weather', 'photography'],
  },
  {
    label: 'Creative Expression (36)',
    categories: ['art', 'career', 'gaming', 'music', 'quotes', 'writing'],
  },
];

export const CATEGORY_ORDER = CATEGORY_GROUPS.flatMap((g) => g.categories);

export const TemplateSearch: FC<{
  total: number;
  query: string;
  onQueryChange: (q: string) => void;
  categoryFilter: string;
  onCategoryChange: (c: string) => void;
}> = ({ total, query, onQueryChange, categoryFilter, onCategoryChange }) => (
  <div className='border-base-300 space-y-2 border-b px-4 py-3'>
    <h2 className='text-neutral text-xs font-semibold tracking-widest uppercase'>
      Templates ({total})
    </h2>
    <input
      type='text'
      value={query}
      onChange={(e) => onQueryChange(e.target.value)}
      placeholder='Search name or category…'
      className='rounded-btn border-base-300 bg-base-100 text-base-content placeholder:text-neutral/50 focus:border-primary/50 focus:ring-primary/30 w-full border px-2.5 py-1.5 text-xs outline-none focus:ring-1'
    />
    <select
      value={categoryFilter}
      onChange={(e) => onCategoryChange(e.target.value)}
      className='rounded-btn border-base-300 bg-base-100 text-base-content focus:border-primary/50 focus:ring-primary/30 w-full border px-2.5 py-1.5 text-xs outline-none focus:ring-1'>
      <option value=''>All categories</option>
      {CATEGORY_GROUPS.map((group) => (
        <optgroup key={group.label} label={group.label}>
          {group.categories.map((cat) => (
            <option key={cat} value={cat}>
              {CATEGORY_LABELS[cat] ?? cat}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  </div>
);
