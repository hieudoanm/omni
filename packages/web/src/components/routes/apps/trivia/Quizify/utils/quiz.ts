import { QuizData } from '../types';

export const parseCsv = (csvText: string): QuizData[] => {
  const lines = csvText.trim().split(/\r?\n/);
  const header = lines[0].split(',').map((h) => h.trim().toLowerCase());
  const expected = ['question', 'red', 'blue', 'green', 'yellow', 'correct'];
  const indices = expected.map((col) => header.indexOf(col));
  if (indices.some((i) => i === -1))
    console.warn('CSV header missing expected columns; using positional mapping.');
  const rows: QuizData[] = [];
  for (let i = 1; i < lines.length; i++) {
    const vals = lines[i].split(',');
    if (vals.length < 6) continue;
    const get = (idx: number) => vals[indices[idx] !== -1 ? indices[idx] : idx].trim();
    const correct = get(5) as 'red' | 'yellow' | 'blue' | 'green';
    rows.push({
      question: get(0),
      answers: { red: get(1), blue: get(2), green: get(3), yellow: get(4) },
      correct,
    });
  }
  return rows;
};

export const colorClassMap: Record<keyof QuizData['answers'], string> = {
  red: 'btn-error',
  yellow: 'btn-warning',
  blue: 'btn-info',
  green: 'btn-success',
};
