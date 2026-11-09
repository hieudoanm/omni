export interface Fields {
  minute: Set<number>;
  hour: Set<number>;
  dayOfMonth: Set<number>;
  month: Set<number>;
  dayOfWeek: Set<number>;
}

export interface Preset {
  label: string;
  value: string;
}
