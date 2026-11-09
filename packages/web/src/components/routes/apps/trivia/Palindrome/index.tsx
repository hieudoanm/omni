import { FC, useCallback, useEffect, useRef, useState } from 'react';

import { PUZZLES, TIMER_START } from './constants';
import { WordData } from './types';
import { fetchDefinition, isEmordnilap, isPalindrome, shuffle } from './utils/puzzle';

export const Palindrome: FC<{ onClose: () => void }> = ({ onClose }) => {
  const [puzzleIndex, setPuzzleIndex] = useState(() => Math.floor(Math.random() * PUZZLES.length));
  const [bank, setBank] = useState<{ l: string; id: number }[]>([]);
  const [placed, setPlaced] = useState<{ l: string; id: number }[]>([]);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(TIMER_START);
  const [feedback, setFeedback] = useState<{ msg: string; ok: boolean } | null>({
    msg: 'Reverse it to check!',
    ok: true,
  });
  const [definition, setDefinition] = useState<WordData | null>(null);
  const [defLoading, setDefLoading] = useState(false);
  const [solved, setSolved] = useState(false);
  const [solvedCount, setSolvedCount] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const puzzle = PUZZLES[puzzleIndex];

  const loadPuzzle = useCallback((idx: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    const p = PUZZLES[idx];
    setBank(shuffle(p.letters).map((l, i) => ({ l, id: i })));
    setPlaced([]);
    setTimer(TIMER_START);
    setFeedback({ msg: 'Reverse it to check!', ok: true });
    setDefinition(null);
    setSolved(false);
    timerRef.current = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          setFeedback({
            msg: `Time up! Answer: ${PUZZLES[idx].answer}`,
            ok: false,
          });
          setSolved(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    loadPuzzle(puzzleIndex);
    containerRef.current?.focus();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [puzzleIndex, loadPuzzle]);

  const nextPuzzle = () => {
    setPuzzleIndex((puzzleIndex + 1) % PUZZLES.length);
  };
  const moveToDrop = (id: number) => {
    if (solved) return;
    const idx = bank.findIndex((i) => i.id === id);
    if (idx === -1) return;
    setPlaced((p) => [...p, bank[idx]]);
    setBank((b) => b.filter((i) => i.id !== id));
  };
  const moveToBank = (idx: number) => {
    if (solved) return;
    setBank((b) => [...b, placed[idx]]);
    setPlaced((p) => p.filter((_, i) => i !== idx));
  };
  const clearPlaced = () => {
    if (solved) return;
    setBank((b) => [...b, ...placed]);
    setPlaced([]);
  };

  const checkAnswer = () => {
    if (solved) return;
    const word = placed
      .map((i) => i.l)
      .join('')
      .toLowerCase();
    if (placed.length < puzzle.letters.length) {
      setFeedback({
        msg: `Use all ${puzzle.letters.length} letters!`,
        ok: false,
      });
      return;
    }
    if (word === puzzle.answer) {
      const pts = Math.max(10, timer * 3);
      setScore((s) => s + pts);
      setSolvedCount((c) => c + 1);
      setFeedback({ msg: `Correct! +${pts} pts`, ok: true });
      setSolved(true);
      if (timerRef.current) clearInterval(timerRef.current);
      setDefLoading(true);
      fetchDefinition(word).then((data) => {
        setDefinition(data);
        setDefLoading(false);
      });
    } else if (puzzle.type === 'palindrome' && isPalindrome(word)) {
      setScore((s) => s + 5);
      setFeedback({
        msg: 'Valid palindrome, but not the target word! +5 pts',
        ok: true,
      });
      setSolved(true);
      if (timerRef.current) clearInterval(timerRef.current);
      setDefLoading(true);
      fetchDefinition(word).then((data) => {
        setDefinition(data);
        setDefLoading(false);
      });
    } else if (puzzle.type === 'emordnilap' && isEmordnilap(word)) {
      setScore((s) => s + 5);
      setFeedback({ msg: 'Valid emordnilap! +5 pts', ok: true });
      setSolved(true);
      if (timerRef.current) clearInterval(timerRef.current);
      setDefLoading(true);
      fetchDefinition(word).then((data) => {
        setDefinition(data);
        setDefLoading(false);
      });
    } else {
      setFeedback({
        msg: `"${word.toUpperCase()}" doesn't work — try again`,
        ok: false,
      });
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      solved ? nextPuzzle() : checkAnswer();
    }
    if (e.key === ' ') {
      e.preventDefault();
      if (!solved) clearPlaced();
    }
    if (e.key.toLowerCase() === 'n' && solved) nextPuzzle();
  };

  const typeBadgeClass = puzzle.type === 'palindrome' ? 'badge-info' : 'badge-warning';
  const typeBadgeLabel = puzzle.type === 'palindrome' ? 'Palindrome' : 'Emordnilap';
  const timerClass = timer <= 10 ? 'text-error' : 'text-base-content';

  return (
    <div ref={containerRef} tabIndex={0} onKeyDown={onKeyDown} className='outline-none'>
      <div className='mb-4 flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <span className='text-xs opacity-50'>Score</span>
          <span className='badge badge-neutral font-normal'>{score}</span>
        </div>
      </div>
      <div className='mb-3 flex items-center justify-between'>
        <span className={`badge ${typeBadgeClass} text-xs`}>{typeBadgeLabel}</span>
        <span className={`font-mono text-sm font-normal ${timerClass}`}>{timer}s</span>
      </div>
      <div className='bg-base-200 mb-2 flex min-h-14 flex-wrap items-center gap-2 rounded-xl p-3'>
        {bank.map((item) => (
          <button
            key={item.id}
            onClick={() => moveToDrop(item.id)}
            className='btn btn-sm btn-outline h-10 w-10 p-0 text-base font-normal'>
            {item.l.toUpperCase()}
          </button>
        ))}
        {bank.length === 0 && <span className='text-base-content/30 text-xs'>bank empty</span>}
      </div>
      <div className='border-base-content/20 mb-3 flex min-h-14 flex-wrap items-center gap-2 rounded-xl border-2 border-dashed p-3'>
        {placed.map((item, idx) => (
          <button
            key={item.id}
            onClick={() => moveToBank(idx)}
            className='btn btn-sm btn-info h-10 w-10 p-0 text-base font-normal'>
            {item.l.toUpperCase()}
          </button>
        ))}
        {placed.length === 0 && (
          <span className='text-base-content/30 text-xs'>click letters to place them here</span>
        )}
      </div>
      <p
        className={`mb-3 min-h-5 text-center text-sm ${feedback?.ok ? 'text-success' : 'text-error'}`}>
        {feedback?.msg ?? ''}
      </p>
      {solved ? (
        <button className='btn btn-primary btn-sm w-full' onClick={nextPuzzle}>
          Next puzzle →
        </button>
      ) : (
        <div className='grid grid-cols-3 gap-2'>
          <button className='btn btn-primary btn-sm' onClick={checkAnswer}>
            Check
          </button>
          <button className='btn btn-secondary btn-sm' onClick={clearPlaced}>
            Clear
          </button>
          <button
            className='btn btn-ghost btn-sm opacity-50'
            onClick={() => {
              setFeedback({ msg: `Answer: ${puzzle.answer}`, ok: false });
              setSolved(true);
              if (timerRef.current) clearInterval(timerRef.current);
            }}>
            Skip
          </button>
        </div>
      )}
      {(defLoading || definition) && (
        <div className='bg-base-200 mt-3 rounded-xl p-3 text-sm'>
          {defLoading ? (
            <div className='flex items-center gap-2 opacity-60'>
              <span className='loading loading-spinner loading-xs' /> Fetching definition...
            </div>
          ) : definition ? (
            <div>
              <p className='mb-1 font-normal uppercase opacity-70'>{definition.word}</p>
              <ul className='space-y-1'>
                {definition.definitions.slice(0, 3).map((d, i) => (
                  <li key={i}>
                    <span className='italic opacity-60'>{d.partOfSpeech}</span>
                    {': '}
                    {d.definition}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className='opacity-50'>No definition found</p>
          )}
        </div>
      )}
      <div className='mt-3 flex items-center justify-between'>
        <p className='text-xs opacity-30'>
          <kbd className='kbd kbd-xs'>Enter</kbd> Check · <kbd className='kbd kbd-xs'>Space</kbd>{' '}
          Clear · <kbd className='kbd kbd-xs'>N</kbd> Next
        </p>
        <span className='text-xs opacity-30'>{solvedCount} solved</span>
      </div>
    </div>
  );
};
Palindrome.displayName = 'Palindrome';
