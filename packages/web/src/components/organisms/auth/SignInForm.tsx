import { FC, useState } from 'react';

interface SignInFormProps {
  onSuccess?: () => void;
  onSignUpClick?: () => void;
  onForgotPasswordClick?: () => void;
}

export const SignInForm: FC<SignInFormProps> = ({
  onSuccess,
  onSignUpClick,
  onForgotPasswordClick,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    onSuccess?.();
  };
  SignInForm.displayName = 'SignInForm';

  return (
    <div className='bg-base-100 border-base-300 mx-auto max-w-sm rounded-2xl border p-8'>
      <div className='mb-8 text-center'>
        <p className='text-primary mb-1 font-serif text-3xl font-bold tracking-widest'>DaisyX</p>
        <p className='text-base-content/50 text-sm'>Welcome back — sign in to continue</p>
      </div>

      <form onSubmit={handleSubmit} className='flex flex-col gap-5'>
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
          <div className='relative'>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder='••••••••'
              className={`input input-bordered w-full pr-10 ${error && !password ? 'input-error' : ''}`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type='button'
              className='text-base-content/40 hover:text-base-content absolute top-1/2 right-3 -translate-y-1/2 text-sm'
              onClick={() => setShowPassword((p) => !p)}>
              {showPassword ? '🙈' : '👁'}
            </button>
          </div>
          <label className='label'>
            <button
              type='button'
              className='label-text-alt text-primary hover:underline'
              onClick={onForgotPasswordClick}>
              Forgot password?
            </button>
          </label>
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
              Signing in…
            </>
          ) : (
            'Sign in'
          )}
        </button>
      </form>

      <div className='divider text-base-content/20 my-6 text-xs'>or</div>

      <button className='btn btn-ghost border-base-300 w-full gap-2 border text-sm'>
        <span className='font-bold tracking-tight'>G</span>
        Sign in with Google
      </button>

      <p className='text-base-content/40 mt-6 text-center text-xs'>
        No account?{' '}
        <button type='button' className='text-primary hover:underline' onClick={onSignUpClick}>
          Create one free
        </button>
      </p>
    </div>
  );
};
