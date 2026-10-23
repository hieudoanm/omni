import { FC } from 'react';

interface CallToActionProps {
  onStartClick?: () => void;
}

export const CallToAction: FC<CallToActionProps> = ({ onStartClick }) => {
  return (
    <section className='mx-auto max-w-5xl px-12 py-24 text-center'>
      <div className='card bg-base-200 border-base-300 border'>
        <div className='card-body items-center py-16'>
          <h2 className='mb-4 font-serif text-4xl leading-snug font-bold'>Ready to build?</h2>
          <p className='text-base-content/60 mb-8 max-w-md text-base leading-relaxed'>
            Start building with DaisyX today. Free forever. No credit card required.
          </p>
          <button type='button' className='btn btn-primary' onClick={onStartClick}>
            Start building
          </button>
        </div>
      </div>
    </section>
  );
};

CallToAction.displayName = 'CallToAction';
