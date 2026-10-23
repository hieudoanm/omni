import { FC, useState } from 'react';

interface SignUpFormProps {
  onSuccess?: () => void;
  onSignInClick?: () => void;
}

export const SignUpForm: FC<SignUpFormProps> = ({ onSuccess, onSignInClick }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (!agreeTerms) {
      setError('You must agree to the terms of service.');
      return;
    }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    onSuccess?.();
  };
  SignUpForm.displayName = 'SignUpForm';

  return (
    <div className='bg-base-100 border-base-300 mx-auto max-w-sm rounded-2xl border p-8'>
      <div className='mb-8 text-center'>
        <p className='text-primary mb-1 font-serif text-3xl font-bold tracking-widest'>DaisyX</p>
        <p className='text-base-content/50 text-sm'>Create your free account</p>
      </div>

      <form onSubmit={handleSubmit} className='flex flex-col gap-5'>
        <div className='grid grid-cols-2 gap-4'>
          <div className='form-control'>
            <label className='label'>
              <span className='label-text text-base-content/50 text-xs'>First name</span>
            </label>
            <input
              type='text'
              placeholder='Jane'
              className='input input-bordered w-full'
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className='form-control'>
            <label className='label'>
              <span className='label-text text-base-content/50 text-xs'>Last name</span>
            </label>
            <input type='text' placeholder='Doe' className='input input-bordered w-full' />
          </div>
        </div>

        <div className='form-control'>
          <label className='label'>
            <span className='label-text text-base-content/50 text-xs'>Email</span>
          </label>
          <input
            type='email'
            placeholder='jane@forma.io'
            className={`input input-bordered w-full ${error && !email.trim() ? 'input-error' : ''}`}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className='form-control'>
          <label className='label'>
            <span className='label-text text-base-content/50 text-xs'>Password</span>
          </label>
          <input
            type='password'
            placeholder='At least 8 characters'
            className={`input input-bordered w-full ${error && password.length < 8 ? 'input-error' : ''}`}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <label className='label'>
            <span className='label-text-alt text-base-content/40'>
              Must be at least 8 characters
            </span>
          </label>
        </div>

        <label className='flex cursor-pointer items-start gap-3 text-sm'>
          <input
            type='checkbox'
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
            className='checkbox checkbox-primary checkbox-sm mt-0.5'
          />
          <span className='text-base-content/50 leading-relaxed'>
            I agree to the{' '}
            <a href='#' className='text-primary hover:underline'>
              Terms of Service
            </a>{' '}
            and{' '}
            <a href='#' className='text-primary hover:underline'>
              Privacy Policy
            </a>
          </span>
        </label>

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
              Creating account…
            </>
          ) : (
            'Create account'
          )}
        </button>
      </form>

      <div className='divider text-base-content/20 my-6 text-xs'>or</div>

      <button className='btn btn-ghost border-base-300 w-full gap-2 border text-sm'>
        <span className='font-bold tracking-tight'>G</span>
        Sign up with Google
      </button>

      <p className='text-base-content/40 mt-6 text-center text-xs'>
        Already have an account?{' '}
        <button type='button' className='text-primary hover:underline' onClick={onSignInClick}>
          Sign in
        </button>
      </p>
    </div>
  );
};
