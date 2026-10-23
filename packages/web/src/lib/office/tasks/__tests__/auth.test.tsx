import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { FC } from 'react';
import { AuthProvider, useAuth } from '@/lib/office/tasks/auth';
import { db } from '@/lib/office/tasks/db';
import type { Member } from '@/lib/office/tasks/types';

jest.mock('@/lib/office/tasks/db', () => ({
  db: {
    session: { get: jest.fn(), put: jest.fn() },
    members: { getAll: jest.fn() },
  },
}));

const mockedDb = jest.mocked(db);

const members: Member[] = [
  { id: 'mem-1', name: 'Alice Chen', email: 'alice@x.io', avatar: 'AC' },
  { id: 'mem-2', name: 'Bob Smith', email: 'bob@x.io', avatar: 'BS' },
];

const Probe: FC = () => {
  const { currentUser, switchMember, signOut } = useAuth();
  return (
    <div>
      <span data-testid='current'>{currentUser?.name ?? 'none'}</span>
      <button onClick={() => void switchMember('mem-2')}>switch</button>
      <button onClick={() => void switchMember('mem-404')}>switch-missing</button>
      <button onClick={() => void signOut()}>signout</button>
    </div>
  );
};

describe('AuthProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('falls back to the first member when the session has no userId', async () => {
    mockedDb.session.get.mockResolvedValue({ id: 'session', userId: null });
    mockedDb.members.getAll.mockResolvedValue(members);

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );

    await waitFor(() => expect(screen.getByTestId('current')).toHaveTextContent('Alice Chen'));
  });

  it('stays null when there are no members', async () => {
    mockedDb.session.get.mockResolvedValue({ id: 'session', userId: null });
    mockedDb.members.getAll.mockResolvedValue([]);

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );

    await waitFor(() => expect(screen.getByTestId('current')).toHaveTextContent('none'));
    expect(mockedDb.session.put).not.toHaveBeenCalled();
  });

  it('restores the member referenced by the session', async () => {
    mockedDb.session.get.mockResolvedValue({ id: 'session', userId: 'mem-2' });
    mockedDb.members.getAll.mockResolvedValue(members);

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );

    await waitFor(() => expect(screen.getByTestId('current')).toHaveTextContent('Bob Smith'));
  });

  it('switches to a named member and persists the session', async () => {
    mockedDb.session.get.mockResolvedValue({ id: 'session', userId: null });
    mockedDb.members.getAll.mockResolvedValue(members);

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );

    await screen.findByTestId('current');
    fireEvent.click(screen.getByText('switch'));

    await waitFor(() => expect(screen.getByTestId('current')).toHaveTextContent('Bob Smith'));
    expect(mockedDb.session.put).toHaveBeenCalledWith({
      id: 'session',
      userId: 'mem-2',
    });
  });

  it('is a no-op when switching to an unknown member', async () => {
    mockedDb.session.get.mockResolvedValue({ id: 'session', userId: null });
    mockedDb.members.getAll.mockResolvedValue(members);

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );

    await screen.findByTestId('current');
    fireEvent.click(screen.getByText('switch-missing'));

    await waitFor(() => expect(screen.getByTestId('current')).toHaveTextContent('Alice Chen'));
    expect(mockedDb.session.put).not.toHaveBeenCalled();
  });

  it('signs out and clears the current user', async () => {
    mockedDb.session.get.mockResolvedValue({ id: 'session', userId: 'mem-2' });
    mockedDb.members.getAll.mockResolvedValue(members);

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );

    await screen.findByTestId('current');
    fireEvent.click(screen.getByText('signout'));

    await waitFor(() => expect(screen.getByTestId('current')).toHaveTextContent('none'));
    expect(mockedDb.session.put).toHaveBeenCalledWith({
      id: 'session',
      userId: null,
    });
  });
});

describe('useAuth', () => {
  it('throws when used outside a provider', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const ErrorProbe: FC = () => {
      useAuth();
      return null;
    };
    expect(() => render(<ErrorProbe />)).toThrow('useAuth must be used within AuthProvider');
    spy.mockRestore();
  });
});
