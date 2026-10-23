export interface Settlement {
  from: string;
  to: string;
  amount: number;
}

export interface PersonRow {
  name: string;
  paid: number;
  owes: number;
}
