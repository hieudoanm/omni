export interface Category {
  emoji: string;
  value: string;
  label: string;
}

export interface Item {
  emoji: string;
  value: string;
  label: string;
  category: string;
}
