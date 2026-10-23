'use client';

import { useState, useCallback } from 'react';

export const useTopicPicker = (topicsMap: Record<string, string[]>) => {
  const [item, setItem] = useState('all');
  const [topic, setTopic] = useState('');
  const [spinning, setSpinning] = useState(false);

  const topics = topicsMap[item] ?? [];

  const spin = useCallback(() => {
    setSpinning(true);
    const duration = 800 + Math.random() * 1000;
    setTimeout(() => {
      setSpinning(false);
      setTopic(topics[Math.floor(Math.random() * topics.length)]);
    }, duration);
  }, [topics]);

  return { item, setItem, topic, spinning, topics, spin };
};
