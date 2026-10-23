export interface Pokemon {
  id: number;
  name: string;
  type: string;
  hp: number;
  attack: number;
  defense: number;
  special_attack: number;
  special_defense: number;
  speed: number;
}
export type SortKey = 'id' | 'hp' | 'attack' | 'speed';
export type SortOrder = 'asc' | 'desc';
