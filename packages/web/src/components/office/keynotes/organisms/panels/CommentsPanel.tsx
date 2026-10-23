'use client';

import { type FC, useState } from 'react';
import { FiCheckCircle, FiCornerUpLeft, FiMessageCircle, FiPlus, FiTrash2 } from 'react-icons/fi';
import { useDeck } from '@/components/office/keynotes/organisms/DeckProvider';
import { formatDate } from '@/lib/office/keynotes/format';

export const CommentsPanel: FC = () => {
  const {
    activeSlideId,
    comments,
    addComment,
    addCommentReply,
    toggleCommentResolved,
    deleteComment,
    questions,
    addQuestion,
    upvoteQuestion,
    markQuestionAnswered,
  } = useDeck();
  const [text, setText] = useState('');
  const [qText, setQText] = useState('');
  const [repliesOpen, setRepliesOpen] = useState<Record<string, boolean>>({});
  const [replyText, setReplyText] = useState<Record<string, string>>({});

  const slideComments = activeSlideId
    ? comments.filter((c) => c.slideId === activeSlideId)
    : comments;

  const submitComment = () => {
    if (!text.trim() || !activeSlideId) return;
    addComment(activeSlideId, text.trim());
    setText('');
  };

  const submitQuestion = () => {
    if (!qText.trim()) return;
    addQuestion(qText.trim());
    setQText('');
  };

  return (
    <div className='no-scrollbar flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-3'>
      <div className='text-xs font-semibold tracking-wide uppercase opacity-70'>
        Comments
        <span className='ml-1 normal-case opacity-50'>({slideComments.length})</span>
      </div>
      <div className='flex gap-1'>
        <input
          type='text'
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submitComment()}
          placeholder='Add a comment…'
          className='input input-xs input-bordered flex-1'
        />
        <button type='button' onClick={submitComment} className='btn btn-primary btn-xs'>
          <FiPlus />
        </button>
      </div>

      <div className='flex flex-col gap-2'>
        {slideComments.length === 0 && (
          <p className='text-center text-[11px] opacity-40'>No comments yet</p>
        )}
        {slideComments.map((c) => (
          <div
            key={c.id}
            className={`border-base-300 bg-base-100 rounded-lg border p-2 ${
              c.resolved ? 'opacity-50' : ''
            }`}>
            <div className='flex items-center justify-between gap-2'>
              <span className='truncate text-xs font-semibold'>{c.author}</span>
              <span className='text-[10px] opacity-40'>{formatDate(c.createdAt)}</span>
            </div>
            <p className='mt-1 text-xs'>{c.text}</p>
            <div className='mt-1.5 flex items-center gap-2'>
              <button
                type='button'
                onClick={() => toggleCommentResolved(c.id)}
                className='text-success flex items-center gap-0.5 text-[11px] hover:underline'>
                <FiCheckCircle className='size-3' />
                {c.resolved ? 'Reopen' : 'Resolve'}
              </button>
              <button
                type='button'
                onClick={() => setRepliesOpen((r) => ({ ...r, [c.id]: !r[c.id] }))}
                className='flex items-center gap-0.5 text-[11px] opacity-60 hover:underline'>
                <FiMessageCircle className='size-3' />
                {c.replies.length} replies
              </button>
              <button
                type='button'
                onClick={() => deleteComment(c.id)}
                className='text-error/70 hover:text-error ml-auto text-[11px]'>
                <FiTrash2 className='size-3' />
              </button>
            </div>
            {repliesOpen[c.id] && (
              <div className='mt-2 flex flex-col gap-1'>
                {c.replies.map((r) => (
                  <div key={r.id} className='bg-base-200 rounded p-1.5 text-[11px]'>
                    <span className='font-semibold'>{r.author}: </span>
                    {r.text}
                  </div>
                ))}
                <div className='flex gap-1'>
                  <input
                    type='text'
                    value={replyText[c.id] ?? ''}
                    onChange={(e) => setReplyText((r) => ({ ...r, [c.id]: e.target.value }))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && (replyText[c.id] ?? '').trim()) {
                        addCommentReply(c.id, (replyText[c.id] ?? '').trim());
                        setReplyText((r) => ({ ...r, [c.id]: '' }));
                      }
                    }}
                    placeholder='Reply…'
                    className='input input-xs input-bordered flex-1'
                  />
                  <button type='button' className='btn btn-ghost btn-xs'>
                    <FiCornerUpLeft />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className='divider my-1' />

      <div className='text-xs font-semibold tracking-wide uppercase opacity-70'>
        Q&A
        <span className='ml-1 normal-case opacity-50'>({questions.length})</span>
      </div>
      <div className='flex gap-1'>
        <input
          type='text'
          value={qText}
          onChange={(e) => setQText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submitQuestion()}
          placeholder='Ask a question…'
          className='input input-xs input-bordered flex-1'
        />
        <button type='button' onClick={submitQuestion} className='btn btn-primary btn-xs'>
          <FiPlus />
        </button>
      </div>
      <div className='flex flex-col gap-1.5'>
        {questions.map((q) => (
          <div key={q.id} className='border-base-300 bg-base-100 rounded-lg border p-2'>
            <p className={`text-xs ${q.answered ? 'line-through opacity-60' : ''}`}>{q.text}</p>
            <div className='mt-1 flex items-center gap-2'>
              <button
                type='button'
                onClick={() => upvoteQuestion(q.id)}
                className='btn btn-ghost btn-xs text-primary gap-0.5'>
                ▲ {q.upvotes}
              </button>
              <span className='text-[10px] opacity-40'>{q.author}</span>
              <button
                type='button'
                onClick={() => markQuestionAnswered(q.id)}
                className='text-success ml-auto text-[11px] hover:underline'>
                {q.answered ? 'Unmark' : 'Mark answered'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
