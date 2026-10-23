import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

export const QuickQuiz: FC<TemplateProps> = ({ data }) => {
  const question = (data.question as string) ?? '';
  const options = (data.options as string[]) ?? [];
  const answer = (data.answer as string) ?? '';
  const explanation = (data.explanation as string) ?? '';
  const citation = (data.citation as string) ?? '';

  return (
    <Background>
      <span className='text-accent mb-4 text-sm font-bold tracking-[0.2em] uppercase'>
        Quick Quiz
      </span>
      <p className='text-base-content text-sm font-semibold'>{question}</p>
      <ol className='mt-4 flex flex-col gap-2'>
        {options.map((opt, i) => {
          const letters = ['A', 'B', 'C', 'D'];
          const isCorrect = opt === answer;
          const citation = (data.citation as string) ?? '';

          return (
            <li
              key={i}
              className={`rounded-box border px-4 py-2 text-sm ${
                isCorrect ? 'border-accent bg-accent/5' : 'border-base-300'
              }`}>
              <span
                className={`font-mono text-sm font-bold ${isCorrect ? 'text-accent' : 'text-neutral/40'}`}>
                {letters[i]}
              </span>
              <span
                className={`ml-4 ${isCorrect ? 'text-base-content font-medium' : 'text-neutral'}`}>
                {opt}
              </span>
            </li>
          );
        })}
      </ol>
      {explanation && (
        <div className='border-accent/20 mt-6 border-t pt-4'>
          <p className='text-neutral text-sm leading-relaxed'>{explanation}</p>
        </div>
      )}
      <Footer citation={citation} />
    </Background>
  );
};

QuickQuiz.displayName = 'QuickQuiz';
