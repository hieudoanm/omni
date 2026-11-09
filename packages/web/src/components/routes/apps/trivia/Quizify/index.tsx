import React, { useEffect, useState } from 'react';
import { Dropzone } from '@/components/atoms';
import { QuizData } from './types';
import { colorClassMap, parseCsv } from './utils/quiz';

export const Quizify: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [questions, setQuestions] = useState<QuizData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<keyof QuizData['answers'] | null>(null);
  const [score, setScore] = useState(0);
  const [csvError, setCsvError] = useState('');

  const quiz = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const progress = ((currentIndex + (selected ? 1 : 0)) / questions.length) * 100;

  const handleSelect = (key: keyof QuizData['answers']) => {
    if (selected) return;
    setSelected(key);
    if (key === quiz.correct) setScore((s) => s + 1);
  };

  const handleNext = () => {
    setSelected(null);
    setCurrentIndex((i) => i + 1);
  };

  const resetQuiz = (newQuestions: QuizData[]) => {
    setQuestions(newQuestions);
    setCurrentIndex(0);
    setSelected(null);
    setScore(0);
  };

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      try {
        const parsed = parseCsv(text);
        if (parsed.length === 0) throw new Error('No valid rows found');
        resetQuiz(parsed);
        setCsvError('');
      } catch (err) {
        console.error(err);
        setCsvError('Failed to parse CSV file. Please ensure it follows the required format.');
      }
    };
    reader.readAsText(file);
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;
      if (!selected) {
        if (e.key === 'r') handleSelect('red');
        if (e.key === 'y') handleSelect('yellow');
        if (e.key === 'b') handleSelect('blue');
        if (e.key === 'g') handleSelect('green');
      }
      if (selected && e.key === 'ArrowRight' && !isLastQuestion) handleNext();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selected, isLastQuestion]);

  const getButtonClass = (key: keyof QuizData['answers']) => {
    if (!selected) return colorClassMap[key];
    if (key === quiz.correct) return 'btn-success';
    if (key === selected) return 'btn-error';
    return 'btn-disabled opacity-50';
  };

  return (
    <>
      {questions.length === 0 ? (
        <div className='space-y-4'>
          <Dropzone accept='.csv' onFile={handleFile} />
          {csvError && <div className='text-error'>{csvError}</div>}
        </div>
      ) : (
        <main className='bg-base-100 text-base-content flex flex-col items-center'>
          <div className='card bg-base-100 border-base-300 w-full max-w-md border shadow-xl'>
            <div className='card-body space-y-4'>
              <div className='space-y-1'>
                <progress className='progress progress-primary w-full' value={progress} max={100} />
                <div className='flex justify-between text-xs opacity-60'>
                  <span>
                    Question {currentIndex + 1} / {questions.length}
                  </span>
                  <span>{Math.round(progress)}%</span>
                </div>
              </div>
              <div className='space-y-1 text-center'>
                <h2 className='card-title justify-center text-lg'>{quiz.question}</h2>
              </div>
              <div className='grid grid-cols-2 gap-3'>
                {(Object.keys(quiz.answers) as Array<keyof QuizData['answers']>).map((key) => (
                  <button
                    key={key}
                    disabled={!!selected && key !== quiz.correct && key !== selected}
                    className={`btn h-20 text-white transition-all ${getButtonClass(key)}`}
                    onClick={() => handleSelect(key)}>
                    {quiz.answers[key]}
                    <span className='ml-1 opacity-60'>({key[0].toUpperCase()})</span>
                  </button>
                ))}
              </div>
              {selected && (
                <div className='alert'>
                  {selected === quiz.correct ? (
                    <span>Correct answer!</span>
                  ) : (
                    <span>Wrong answer</span>
                  )}
                </div>
              )}
              {selected && !isLastQuestion && (
                <button className='btn btn-primary w-full' onClick={handleNext}>
                  Next Question →
                </button>
              )}
              {selected && isLastQuestion && (
                <div className='space-y-3 text-center'>
                  <div className='text-lg font-normal'>Quiz completed!</div>
                  <div>
                    Score:{' '}
                    <span className='font-normal'>
                      {score} / {questions.length}
                    </span>
                  </div>
                  <button className='btn btn-outline w-full' onClick={() => resetQuiz(questions)}>
                    Reset Quiz
                  </button>
                  <div className='text-xs opacity-60'>Keyboard: R Y B G • → Next</div>
                </div>
              )}
            </div>
          </div>
        </main>
      )}
    </>
  );
};
Quizify.displayName = 'Quizify';
