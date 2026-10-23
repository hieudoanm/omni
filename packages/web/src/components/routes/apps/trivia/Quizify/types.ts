export interface QuizData {
  question: string;
  answers: { red: string; yellow: string; blue: string; green: string };
  correct: 'red' | 'yellow' | 'blue' | 'green';
}
