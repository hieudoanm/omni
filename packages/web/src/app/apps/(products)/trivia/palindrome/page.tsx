'use client';

import { useRouter } from 'next/navigation';
import { Palindrome } from '@/components/routes/apps/trivia/Palindrome';

const GamesTriviaPalindrome = () => {
  const router = useRouter();
  return <Palindrome onClose={() => router.push('/apps/trivia')} />;
};

export default GamesTriviaPalindrome;
