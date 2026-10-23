export interface Party {
  name: string;
  abbreviation: string;
  color: string;
  seats: number;
}
export interface Chamber {
  name: string;
  totalSeats: number;
  parties: Party[];
}
export interface Country {
  name: string;
  flag: string;
  chambers: Record<string, Chamber>;
}
