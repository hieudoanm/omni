import { FC, useState } from 'react';

interface PasswordResetProps {
  onSuccess?: () => void;
  onBackToSignIn?: () => void;
  token?: string;
}

export const PasswordReset: FC<PasswordResetProps> = ({
  onSuccess,
  onBackToSignIn,
  token: propToken,
}) => {
  const [token] = useState(() => {
    if (propToken) return propToken;
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('token') || params.get('code') || '';
    }
    return '';
  });
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setSuccess(true);
  };

  if (success) {
    return (
      <div className='bg-base-100 border-base-300 mx-auto max-w-sm rounded-2xl border p-8 text-center'>
        <div className='mb-6 text-5xl'>✓</div>
        <h3 className='mb-2 font-serif text-xl font-bold'>Password updated</h3>
        <p className='text-base-content/50 mb-7 text-sm leading-relaxed'>
          Your password has been reset successfully.
        </p>
        <button type='button' className='btn btn-primary w-full' onClick={onSuccess}>
          Sign in with new password
        </button>
      </div>
    );
  }

  if (!token) {
    return (
      <div className='bg-base-100 border-base-300 mx-auto max-w-sm rounded-2xl border p-8 text-center'>
        <div className='mb-6 text-5xl'>⚠</div>
        <h3 className='mb-2 font-serif text-xl font-bold'>Invalid reset link</h3>
        <p className='text-base-content/50 mb-7 text-sm leading-relaxed'>
          This password reset link is invalid or has expired.
        </p>
        <button type='button' className='btn btn-primary w-full' onClick={onBackToSignIn}>
          Back to sign in
        </button>
      </div>
    );
  }

  return (
    <div className='bg-base-100 border-base-300 mx-auto max-w-sm rounded-2xl border p-8'>
      <div className='mb-8 text-center'>
        <p className='text-primary mb-1 font-serif text-3xl font-bold tracking-widest'>DaisyX</p>
        <p className='text-base-content/50 text-sm'>Choose a new password</p>
      </div>

      <form onSubmit={handleSubmit} className='flex flex-col gap-5'>
        <div className='form-control'>
          <label className='label'>
            <span className='label-text text-base-content/50 text-xs'>New password</span>
          </label>
          <div className='relative'>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder='At least 8 characters'
              className={`input input-bordered w-full pr-10 ${error && password.length < 8 ? 'input-error' : ''}`}
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
        </div>

        <div className='form-control'>
          <label className='label'>
            <span className='label-text text-base-content/50 text-xs'>Confirm password</span>
          </label>
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder='Repeat your password'
            className={`input input-bordered w-full ${error && password !== confirmPassword ? 'input-error' : ''}`}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        {error && (
          <div role='alert' className='alert alert-error py-2 text-sm'>
            <span>✕</span>
            <span>{error}</span>
          </div>
        )}

        <ul className='text-base-content/40 flex flex-col gap-1 text-xs'>
          <li className={`flex items-center gap-1 ${password.length >= 8 ? 'text-success' : ''}`}>
            <span>{password.length >= 8 ? '✓' : '○'}</span> At least 8 characters
          </li>
          <li
            className={`flex items-center gap-1 ${password === confirmPassword && password ? 'text-success' : ''}`}>
            <span>{password === confirmPassword && password ? '✓' : '○'}</span> Passwords match
          </li>
        </ul>

        <button
          type='submit'
          className={`btn btn-primary w-full ${loading ? 'btn-disabled' : ''}`}
          disabled={loading}>
          {loading ? (
            <>
              <span className='loading loading-spinner loading-xs' />
              Resetting…
            </>
          ) : (
            'Reset password'
          )}
        </button>
      </form>

      <p className='text-base-content/40 mt-6 text-center text-xs'>
        <button type='button' className='text-primary hover:underline' onClick={onBackToSignIn}>
          Back to sign in
        </button>
      </p>
    </div>
  );
};

PasswordReset.displayName = 'PasswordReset';
