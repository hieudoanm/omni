import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

export const InvoiceCard: FC<TemplateProps> = ({ data }) => {
  const invoiceNumber = (data.invoiceNumber as string) ?? 'INV-2025-001';
  const client = (data.client as string) ?? 'Acme Corp';
  const amount = (data.amount as string) ?? '$4,500';
  const dueDate = (data.dueDate as string) ?? 'Apr 30, 2025';
  const items = (data.items as { desc: string; amount: string }[]) ?? [
    { desc: 'UI Design', amount: '$2,500' },
    { desc: 'Development', amount: '$2,000' },
  ];

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <div className='flex items-start justify-between'>
        <div>
          <span className='text-accent text-xs font-bold tracking-[0.2em] uppercase'>Invoice</span>
          <h1 className='text-base-content mt-1 text-4xl font-bold'>{invoiceNumber}</h1>
        </div>
        <span className='bg-accent/10 text-accent rounded px-2.5 py-0.5 text-xs font-bold'>
          {client}
        </span>
      </div>
      <div className='bg-base-200 rounded-box mt-5 overflow-hidden'>
        <div className='border-base-300 flex border-b px-3 py-2'>
          <span className='text-neutral flex-1 text-xs font-bold uppercase'>Description</span>
          <span className='text-neutral text-xs font-bold uppercase'>Amount</span>
        </div>
        {items.map((item, i) => (
          <div
            key={i}
            className='border-base-300 flex items-center justify-between border-b px-3 py-2.5 last:border-b-0'>
            <span className='text-base-content text-xs font-medium'>{item.desc}</span>
            <span className='text-base-content text-xs font-semibold'>{item.amount}</span>
          </div>
        ))}
      </div>
      <div className='bg-base-200 rounded-box mt-4 flex items-center justify-between px-4 py-3'>
        <span className='text-neutral text-xs'>
          Due <time>{dueDate}</time>
        </span>
        <div className='text-right'>
          <span className='text-neutral text-xs font-bold uppercase'>Total</span>
          <p className='text-base-content text-lg font-black'>{amount}</p>
        </div>
      </div>
      <Footer citation={citation} />
    </Background>
  );
};
InvoiceCard.displayName = 'InvoiceCard';
