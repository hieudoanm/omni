import { fireEvent, render, screen } from '@testing-library/react';
import { TaskSignInState } from '@/components/office/tasks/molecules/TaskSignInState';

describe('TaskSignInState', () => {
  it('renders the sign-in prompt', () => {
    render(<TaskSignInState onSignIn={() => {}} />);
    expect(screen.getByText('Sign in to view your tasks')).toBeInTheDocument();
    expect(
      screen.getByText('Choose an account to see your task list and manage your work.'),
    ).toBeInTheDocument();
  });

  it('calls onSignIn when the button is clicked', () => {
    const onSignIn = jest.fn();
    render(<TaskSignInState onSignIn={onSignIn} />);
    fireEvent.click(screen.getByText('Sign in'));
    expect(onSignIn).toHaveBeenCalledTimes(1);
  });
});
