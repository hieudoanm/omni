'use client';

import { useRouter } from 'next/navigation';
import { Pokedex } from '@/components/routes/apps/trivia/Pokedex';

const GamesTriviaPokedex = () => {
  const router = useRouter();
  return <Pokedex onClose={() => router.push('/apps/trivia')} />;
};

export default GamesTriviaPokedex;
