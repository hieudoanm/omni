import { FC, useState } from 'react';

interface PasswordForgetProps {
  onSuccess?: () => void;
  onBackToSignIn?: () => void;
}

export const PasswordForget: FC<PasswordForgetProps> = ({ onSuccess, onBackToSignIn }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    setSent(true);
  };

  if (sent) {
    return (
      <div className='bg-base-100 border-base-300 mx-auto max-w-sm rounded-2xl border p-8 text-center'>
        <div className='mb-6 text-5xl'>✉</div>
        <h3 className='mb-2 font-serif text-xl font-bold'>Check your inbox</h3>
        <p className='text-base-content/50 mb-7 text-sm leading-relaxed'>
          We&apos;ve sent a password reset link to{' '}
          <span className='text-base-content font-medium'>{email}</span>
        </p>
        <button type='button' className='btn btn-primary w-full' onClick={onSuccess}>
          Done
        </button>
        <p className='text-base-content/40 mt-4 text-center text-xs'>
          Didn&apos;t receive the email?{' '}
          <button
            type='button'
            className='text-primary hover:underline'
            onClick={() => setSent(false)}>
            Resend
          </button>
        </p>
      </div>
    );
  }

  return (
    <div className='bg-base-100 border-base-300 mx-auto max-w-sm rounded-2xl border p-8'>
      <div className='mb-8 text-center'>
        <p className='text-primary mb-1 font-serif text-3xl font-bold tracking-widest'>DaisyX</p>
        <p className='text-base-content/50 text-sm'>Forgot your password?</p>
      </div>

      <p className='text-base-content/50 mb-6 text-sm leading-relaxed'>
        No worries — enter your email and we&apos;ll send you a reset link.
      </p>

      <form onSubmit={handleSubmit} className='flex flex-col gap-5'>
        <div className='form-control'>
          <label className='label'>
            <span className='label-text text-base-content/50 text-xs'>Email</span>
          </label>
          <input
            type='email'
            placeholder='jane@forma.io'
            className={`input input-bordered w-full ${error ? 'input-error' : ''}`}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {error && (
          <div role='alert' className='alert alert-error py-2 text-sm'>
            <span>✕</span>
            <span>{error}</span>
          </div>
        )}

        <button
          type='submit'
          className={`btn btn-primary w-full ${loading ? 'btn-disabled' : ''}`}
          disabled={loading}>
          {loading ? (
            <>
              <span className='loading loading-spinner loading-xs' />
              Sending…
            </>
          ) : (
            'Send reset link'
          )}
        </button>
      </form>

      <p className='text-base-content/40 mt-6 text-center text-xs'>
        Remember your password?{' '}
        <button type='button' className='text-primary hover:underline' onClick={onBackToSignIn}>
          Sign in
        </button>
      </p>
    </div>
  );
};

PasswordForget.displayName = 'PasswordForget';
