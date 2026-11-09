import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

interface QAPair {
  question: string;
  answer: string;
}

export const InterviewPrep: FC<TemplateProps> = ({ data }) => {
  const title = (data.title as string) ?? 'Interview Prep';
  const role = (data.role as string) ?? '';
  const questions = (data.questions as QAPair[]) ?? [];
  const tip = (data.tip as string) ?? '';

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <h1 className='text-primary mb-0.5 text-4xl font-bold'>{title}</h1>
      {role && <p className='badge badge-secondary mb-3'>{role}</p>}
      <ul className='mb-3 w-full max-w-lg space-y-2 text-left'>
        {questions.map((qa, index) => (
          <li key={index} className='bg-base-200 rounded-lg p-2'>
            <p className='text-primary text-xs font-semibold'>
              Q{index + 1}: {qa.question}
            </p>
            <p className='text-base-content/70 mt-1 text-xs leading-relaxed'>{qa.answer}</p>
          </li>
        ))}
      </ul>
      {tip && (
        <p className='text-accent bg-accent/10 rounded-lg px-2 py-1 text-xs font-medium'>
          💡 {tip}
        </p>
      )}
      <Footer citation={citation} />
    </Background>
  );
};
InterviewPrep.displayName = 'InterviewPrep';
