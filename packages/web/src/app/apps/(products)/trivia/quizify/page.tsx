'use client';

import { useRouter } from 'next/navigation';
import { Quizify } from '@/components/routes/apps/trivia/Quizify';

const GamesTriviaQuizify = () => {
  const router = useRouter();
  return <Quizify onClose={() => router.push('/apps/trivia')} />;
};

export default GamesTriviaQuizify;
