import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Register from '../components/register';
import { createMockLocalStorage } from './test-helpers';

const mockNavigate = jest.fn();

// This lets us assert that successful register redirects home.
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate
}));

describe('Register', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
    mockNavigate.mockClear();

    Object.defineProperty(window, 'localStorage', {
      value: createMockLocalStorage(),
      writable: true
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('lets the user fill out each field', () => {
    render(<Register />);

    const usernameInput = screen.getByLabelText(/username/i);
    const emailInput = screen.getByLabelText(/^email$/i);
    const passwordInput = screen.getByLabelText(/password/i);

    // Step 1: show the component reacts to typing.
    fireEvent.change(usernameInput, { target: { name: 'username', value: 'student' } });
    fireEvent.change(emailInput, { target: { name: 'email', value: 'student@test.com' } });
    fireEvent.change(passwordInput, { target: { name: 'password', value: '123456' } });

    expect(usernameInput).toHaveValue('student');
    expect(emailInput).toHaveValue('student@test.com');
    expect(passwordInput).toHaveValue('123456');
  });

  test('submits the form and saves the returned user', async () => {
    const setUser = jest.fn();

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        token: 'new-token',
        user: { username: 'student' }
      })
    });

    render(<Register setUser={setUser} />);

    fireEvent.change(screen.getByLabelText(/username/i), { target: { name: 'username', value: 'student' } });
    fireEvent.change(screen.getByLabelText(/^email$/i), { target: { name: 'email', value: 'student@test.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { name: 'password', value: '123456' } });

    // Step 2: submit and expect a happy-path flow.
    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/users', expect.objectContaining({
        method: 'POST'
      }));
    });

    expect(window.localStorage.setItem).toHaveBeenCalledWith('token', 'new-token');
    expect(window.localStorage.setItem).toHaveBeenCalledWith('username', 'student');
    expect(setUser).toHaveBeenCalledWith({ username: 'student' });
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});
