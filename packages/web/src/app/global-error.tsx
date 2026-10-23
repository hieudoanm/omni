'use client';

const GlobalError = ({ reset }: { error: Error & { digest?: string }; reset: () => void }) => {
  return (
    <html>
      <body>
        <div className='flex min-h-screen flex-col items-center justify-center gap-4'>
          <h2 className='text-2xl font-bold'>Something went wrong!</h2>
          <button
            onClick={() => reset()}
            className='rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600'>
            Try again
          </button>
        </div>
      </body>
    </html>
  );
};

export default GlobalError;
