import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

interface ChatMessage {
  sender: string;
  text: string;
  time?: string;
}

export const Chat: FC<TemplateProps> = ({ data }) => {
  const title = (data.title as string) ?? '';
  const messages = (data.messages as ChatMessage[]) ?? [];

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      {title && (
        <span className='text-accent mb-4 text-sm font-bold tracking-[0.2em] uppercase'>
          {title}
        </span>
      )}
      <div className='flex flex-1 flex-col justify-center gap-3'>
        {messages.map((msg, i) => {
          const isEven = i % 2 === 0;
          return (
            <div key={i} className={`flex flex-col ${isEven ? 'items-start' : 'items-end'}`}>
              <span className='text-neutral mb-2 text-sm font-medium'>{msg.sender}</span>
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                  isEven ? 'bg-accent/10 rounded-bl-sm' : 'bg-primary rounded-br-sm text-white'
                }`}>
                <p
                  className={`text-sm leading-relaxed ${
                    isEven ? 'text-base-content' : 'text-white'
                  }`}>
                  {msg.text}
                </p>
              </div>
              {msg.time && <time className='text-neutral mt-2 text-sm'>{msg.time}</time>}
              <Footer citation={citation} />
            </div>
          );
        })}
      </div>
    </Background>
  );
};

Chat.displayName = 'Chat';
