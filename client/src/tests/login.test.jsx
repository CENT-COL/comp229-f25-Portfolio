import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from '../components/login';
import { createMockLocalStorage } from './test-helpers';

const mockNavigate = jest.fn();

// Mock the router hook to verify redirects.
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate
}));

describe('Login', () => {
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

  test('updates the inputs as the user types', () => {
    render(<Login />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    // Step 1: simulate the user typing.
    fireEvent.change(emailInput, { target: { name: 'email', value: 'student@test.com' } });
    fireEvent.change(passwordInput, { target: { name: 'password', value: '123456' } });

    expect(emailInput).toHaveValue('student@test.com');
    expect(passwordInput).toHaveValue('123456');
  });

  test('sends the credentials to the API and stores the token', async () => {
    const setUser = jest.fn();

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        token: 'token-123',
        user: { username: 'student' }
      })
    });

    render(<Login setUser={setUser} />);

    fireEvent.change(screen.getByLabelText(/email/i), { target: { name: 'email', value: 'student@test.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { name: 'password', value: '123456' } });

    // Step 2: submit the form and wait for the mocked API call.
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/users/login', expect.objectContaining({
        method: 'POST'
      }));
    });

    expect(window.localStorage.setItem).toHaveBeenCalledWith('token', 'token-123');
    expect(window.localStorage.setItem).toHaveBeenCalledWith('username', 'student');
    expect(setUser).toHaveBeenCalledWith({ username: 'student' });
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});
