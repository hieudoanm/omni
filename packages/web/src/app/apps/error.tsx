'use client';

import { ErrorTemplate } from '@/components/templates/shared/ErrorTemplate';

const messages = [
  'Something went wrong on our end.',
  'An unexpected error occurred.',
  'We ran into a server issue.',
  'The server had trouble processing your request.',
  "This wasn't supposed to happen.",
];

const ErrorPage = ({ error, reset }: { error: Error; reset: () => void }) => {
  return (
    <ErrorTemplate
      error={{
        code: 500,
        message: error.message ?? 'Internal server error',
      }}
      messages={messages}
    />
  );
};

export default ErrorPage;
