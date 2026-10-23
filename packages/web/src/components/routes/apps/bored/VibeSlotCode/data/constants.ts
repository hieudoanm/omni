import projects from './projects.json';
import data from './stacks.json';

export interface Option {
  name: string;
  link: string;
}

export interface Reel {
  type: string;
  emoji: string;
  label: string;
  options: Option[];
}

export interface Category {
  id: string;
  emoji: string;
  label: string;
  reels: Reel[];
}

export const TECH_REEL_COUNT = 4;
export const PROJECT_REEL_COUNT = 1;

const projectByCategory = new Map(projects.map((p) => [p.id, p]));

export const CATEGORIES: Category[] = data.map((cat) => {
  const projectCat = projectByCategory.get(cat.id);
  return {
    ...cat,
    reels: [
      ...cat.reels,
      {
        type: 'project',
        emoji: '💡',
        label: 'Project Idea',
        options: projectCat?.reels.flatMap((r) => r.options) ?? [],
      },
    ],
  };
});

export const TOTAL_COMBINATIONS = CATEGORIES[0].reels
  .slice(0, TECH_REEL_COUNT)
  .reduce((acc, reel) => acc * reel.options.length, 1);
